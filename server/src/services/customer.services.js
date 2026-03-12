import * as customerModel from '../models/customer.models.js';
import * as invoiceModel from '../models/invoice.models.js';

const getCustomersService = async () => {
  const customers = await customerModel.getCustomers();
  return customers;
};

const getCustomerInvoicesService = async (customer_id) => {
  const invoices = await invoiceModel.getInvoices(customer_id);
  return invoices;
};

export { getCustomersService, getCustomerInvoicesService };
