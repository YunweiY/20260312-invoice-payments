import * as invoiceModel from '../models/invoice.models.js';
import * as customerModel from '../models/customer.models.js';
import { NotFoundError } from '../errors/AppError.js';
import { BadRequestError } from '../errors/AppError.js';

const getInvoicesService = async (status, from, to) => {
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

  const invoices = await invoiceModel.getInvoices(status, fromDate, toDate);
  return invoices;
};

const getInvoiceByIdService = async (id) => {
  const invoice = await invoiceModel.getInvoiceById(id);
  if (!invoice) {
    throw NotFoundError('Invoice not found', 'NOT_FOUND');
  }
  return invoice;
};

const createInvoiceService = async (customer_id, amount, currency, due_at) => {
  // validate whether amount is a positive number
  if (amount <= 0) {
    throw BadRequestError('Amount must be a positive number', 'BAD_REQUEST');
  }

  // validate whether due_at is in the future
  const dueDate = new Date(due_at);
  if (dueDate <= new Date()) {
    throw BadRequestError('Due date must be in the future', 'BAD_REQUEST');
  }

  // validate whether customer exists
  const customer = await customerModel.getCustomerById(customer_id);
  if (!customer) {
    throw NotFoundError('Customer not found', 'NOT_FOUND');
  }

  const invoice = await invoiceModel.createInvoice(
    customer_id,
    amount,
    currency,
    dueDate
  );
  return invoice;
};

export { getInvoicesService, getInvoiceByIdService, createInvoiceService };
