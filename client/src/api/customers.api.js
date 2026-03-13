import apiClient from './client';

export const getAllCustomers = async () => {
  const response = await apiClient.get('/customers');
  return response.data.data;
};
