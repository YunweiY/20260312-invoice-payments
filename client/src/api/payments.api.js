import apiClient from './client';

export const getAllPayments = async () => {
  const response = await apiClient.get('/payments');
  return response.data.data;
};
