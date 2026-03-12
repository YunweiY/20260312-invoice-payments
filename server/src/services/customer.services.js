import * as customerModel from '../models/customer.models.js';
import * as invoiceModel from '../models/invoice.models.js';
import { BadRequestError } from '../errors/AppError.js';

const getCustomersService = async () => {
  const customers = await customerModel.getCustomers();
  return customers;
};

const getCustomerInvoicesService = async (customer_id, status, from, to) => {
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

  const invoices = await invoiceModel.getInvoices(
    customer_id,
    status,
    fromDate,
    toDate
  );

  return invoices;
};

export { getCustomersService, getCustomerInvoicesService };
