import apiClient from './client';
import { toIso8601 } from '@/lib/utils';

export const getAllInvoices = async (status, from, to) => {
  const response = await apiClient.get('/invoices', {
    params: {
      status,
      from: toIso8601(from),
      to: toIso8601(to),
    },
  });
  return response.data.data;
};

export const getInvoiceById = async (id) => {
  const response = await apiClient.get(`/invoices/${id}`);
  return response.data.data;
};

export const createInvoice = async (customer_id, amount, currency, due_at) => {
  const response = await apiClient.post('/invoices', {
    customer_id,
    amount: String(amount),
    currency,
    due_at: toIso8601(due_at) ?? due_at,
  });
  return response.data.data;
};

export const updateInvoiceStatus = async (id, status) => {
  const response = await apiClient.patch(`/invoices/${id}/status`, {
    status,
  });
  return response.data.data;
};
