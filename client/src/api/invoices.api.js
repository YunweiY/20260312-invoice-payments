import apiClient from './client';

export const getAllInvoices = async (customer_id, status, from, to) => {
  const response = await apiClient.get('/invoices', {
    params: {
      customer_id,
      status,
      from,
      to,
    },
  });
  return response.data.data;
};
