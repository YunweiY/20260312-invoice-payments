import * as invoiceModel from '../models/invoice.models.js';
import { NotFoundError } from '../errors/AppError.js';

const getInvoicesService = async () => {
  const invoices = await invoiceModel.getInvoices();
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
