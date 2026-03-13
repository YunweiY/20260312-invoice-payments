import apiClient from './client';

export const getAllInvoices = async (status, from, to) => {
  const response = await apiClient.get('/invoices', {
    params: {
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

export const createInvoice = async (customer_id, amount, currency, due_at) => {
  console.log(customer_id, amount, currency, due_at);
  const response = await apiClient.post('/invoices', {
    customer_id,
    amount: parseFloat(amount),
    currency,
    due_at,
  });
  return response.data.data;
};
