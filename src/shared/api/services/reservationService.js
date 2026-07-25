import apiClient from '../apiClient';

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.reservations)) return payload.reservations;
  return [];
};

const normalizeEntity = (payload) => {
  if (!payload) return null;
  return payload?.reservation || payload?.data || payload;
};

const normalizeQueryParams = (params = {}) => {
  const normalized = {};

  if (params?.restaurantId != null || params?.restaurant_id != null) {
    normalized.restaurant_id = params.restaurantId ?? params.restaurant_id;
  }

  if (params?.userId != null || params?.user_id != null) {
    normalized.user_id = params.userId ?? params.user_id;
  }

  return normalized;
};

const reservationService = {
  async getReservations(params = {}) {
    try {
      const response = await apiClient.get('/reservation', { params: normalizeQueryParams(params) });
      return normalizeList(response.data);
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  async getReservationById(id) {
    try {
      const response = await apiClient.get(`/reservation/${id}`);
      return normalizeEntity(response.data);
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  async createReservation(payload) {
    try {
      const response = await apiClient.post('/reservation', payload);
      return normalizeEntity(response.data);
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  async updateReservation(id, payload) {
    try {
      const response = await apiClient.put(`/reservation/${id}`, payload);
      return normalizeEntity(response.data);
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  async cancelReservation(id) {
    try {
      const response = await apiClient.put(`/reservation/${id}`, {
        reservation_state: 'cancelada',
      });
      return normalizeEntity(response.data);
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  async deleteReservation(id) {
    try {
      const response = await apiClient.delete(`/reservation/${id}`);
      return normalizeEntity(response.data);
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },
};

export default reservationService;
