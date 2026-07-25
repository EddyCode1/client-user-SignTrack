import adminClient from '../adminClient';

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeEntity = (payload) => {
  if (!payload) return null;
  return payload?.data || payload;
};

const normalizeQueryParams = (params = {}) => {
  const normalized = {};
  if (params?.restaurantId != null || params?.restaurant_id != null) {
    normalized.restaurant_id = params.restaurantId ?? params.restaurant_id;
  }
  return normalized;
};

export const reviewService = {
  async getReviews(params = {}) {
    try {
      const response = await adminClient.get('/review', { params: normalizeQueryParams(params) });
      const data = normalizeList(response.data);
      return {
        success: true,
        data,
        total: response.data?.total ?? data.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: [],
      };
    }
  },

  async createReview(payload) {
    try {
      const response = await adminClient.post('/review', payload);
      return {
        success: true,
        data: normalizeEntity(response.data),
        message: response.data?.message || 'Reseña creada',
      };
    } catch (error) {
      const validationErrors = error.response?.data?.errors;
      let errorMsg = error.response?.data?.message || error.message;
      if (Array.isArray(validationErrors) && validationErrors.length) {
        errorMsg = validationErrors
          .map((err) => (typeof err === 'string' ? err : err.message || err.field))
          .filter(Boolean)
          .join('; ');
      }
      return { success: false, error: errorMsg };
    }
  },
};

export default reviewService;
