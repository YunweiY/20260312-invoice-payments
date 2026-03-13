import apiClient from './client';
import { toIso8601 } from '@/lib/utils';

export const getAllCustomers = async (page, limit) => {
  const response = await apiClient.get('/customers', {
    params: { page, limit },
  });
  return { customers: response.data.data, meta: response.data.meta };
};

export const getCustomerInvoices = async (
  id,
  status,
  from,
  to,
  page,
  limit
) => {
  const response = await apiClient.get(`/customers/${id}/invoices`, {
    params: {
      status,
      from: toIso8601(from),
      to: toIso8601(to),
      page,
      limit,
    },
  });
  return { invoices: response.data.data, meta: response.data.meta };
};
