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

export const getInvoiceById = async (id) => {
  const response = await apiClient.get(`/invoices/${id}`);
  return response.data.data;
};
