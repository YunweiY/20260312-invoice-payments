import apiClient from './client';

export const getAllPayments = async (page, limit) => {
  const response = await apiClient.get('/payments', {
    params: { page, limit },
  });
  return { payments: response.data.data, meta: response.data.meta };
};

export const createPayment = async (invoice_id, amount) => {
  const response = await apiClient.post(`/invoices/${invoice_id}/payments`, {
    amount: String(amount),
  });
  return response.data.data;
};
