import apiClient from './client';
import { toIso8601 } from '@/lib/utils';

export const getAllCustomers = async () => {
  const response = await apiClient.get('/customers');
  return response.data.data;
};

export const getCustomerInvoices = async (id, status, from, to) => {
  const response = await apiClient.get(`/customers/${id}/invoices`, {
    params: {
      status,
      from: toIso8601(from),
      to: toIso8601(to),
    },
  });
  return response.data.data;
};
