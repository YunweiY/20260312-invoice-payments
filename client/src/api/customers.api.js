import apiClient from './client';

export const getAllCustomers = async () => {
  const response = await apiClient.get('/customers');
  return response.data.data;
};

export const getCustomerInvoices = async (id, status, from, to) => {
  const response = await apiClient.get(`/customers/${id}/invoices`, {
    params: {
      status,
      from,
      to,
    },
  });
  return response.data.data;
};
