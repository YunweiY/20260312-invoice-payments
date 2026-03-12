import * as invoiceModel from '../models/invoice.models.js';
import { NotFoundError } from '../errors/AppError.js';

const getInvoicesService = async (status, fromDate, toDate) => {
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

export { getInvoicesService, getInvoiceByIdService };
