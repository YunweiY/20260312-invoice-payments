import * as invoiceModel from '../models/invoice.models.js';

const getInvoicesService = async () => {
  const invoices = await invoiceModel.getInvoices();
  return invoices;
};

export { getInvoicesService };
