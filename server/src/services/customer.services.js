import * as customerModel from '../models/customer.models.js';
import * as invoiceModel from '../models/invoice.models.js';
import { BadRequestError } from '../errors/AppError.js';

const getCustomersService = async (page, limit) => {
  const { customers, total } = await customerModel.getCustomers(page, limit);
  const totalPages = Math.ceil(total / limit);
  return { customers, total, totalPages };
};

const getCustomerInvoicesService = async (
  customer_id,
  status,
  from,
  to,
  page,
  limit
) => {
  let fromDate;
  let toDate;

  if (from) {
    fromDate = new Date(from);
  }
  if (to) {
    toDate = new Date(to);
  }

  if (fromDate && toDate && fromDate > toDate) {
    throw BadRequestError('From date must be before to date', 'BAD_REQUEST');
  }

  const { invoices, total } = await invoiceModel.getInvoices(
    customer_id,
    status,
    fromDate,
    toDate,
    page,
    limit
  );

  const totalPages = Math.ceil(total / limit);

  return { invoices, total, totalPages };
};

export { getCustomersService, getCustomerInvoicesService };
