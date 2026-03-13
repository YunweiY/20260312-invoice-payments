import apiClient from './client';

export const getAllPayments = async () => {
  const response = await apiClient.get('/payments');
  return response.data.data;
};

export const createPayment = async (invoice_id, amount) => {
  const response = await apiClient.post(`/invoices/${invoice_id}/payments`, {
    amount: parseFloat(amount),
  });
  return response.data.data;
};
