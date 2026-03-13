import apiClient from './client';

export const getAllInvoices = async () => {
  const response = await apiClient.get('/invoices');
  return response.data.data;
};
