import apiClient from '../apiClient';

const notificationService = {
  async getNotifications() {
    try {
      const response = await apiClient.get('/information');
      return response.data?.data || response.data || [];
    } catch (error) {
      return [];
    }
  },
};

export default notificationService;
