import * as invoiceModel from '../models/invoice.models.js';
import * as customerModel from '../models/customer.models.js';
import * as paymentModel from '../models/payment.models.js';
import prisma from '../config/prisma.js';
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

const payInvoiceService = async (id, amount) => {
  // validate whether the invoice exists
  const invoice = await invoiceModel.getInvoiceById(id);
  if (!invoice) {
    throw NotFoundError('Invoice not found', 'NOT_FOUND');
  }

  // validate whether the amount is positive
  if (amount <= 0) {
    throw BadRequestError('Amount must be a positive number', 'BAD_REQUEST');
  }

  // validate whether the invoice is PENDING, a DRAFT/PAID/VOID invoice cannot be paid
  if (invoice.status !== 'PENDING') {
    throw BadRequestError(
      'Invoice is not pending, current status is ' + invoice.status,
      'BAD_REQUEST'
    );
  }

  // validate whether the amount is less than or equal to the remaining unpaid amount
  const totalPaid = invoice.payments.reduce(
    (acc, payment) => acc + payment.amount.toNumber(),
    0
  );
  const remainingAmount = invoice.amount - totalPaid;
  console.log('remainingAmount', remainingAmount);
  console.log('amount', amount);
  console.log('totalPaid', totalPaid);
  // if the amount is greater than the remaining unpaid amount, throw an error
  if (amount > remainingAmount) {
    throw BadRequestError(
      'Amount is greater than the remaining unpaid amount, remaining amount is $' +
        remainingAmount,
      'BAD_REQUEST'
    );
  }
  // if the amount is equal to the remaining unpaid amount, set the invoice status to PAID
  // use transaction to update the invoice and create the payment
  else if (amount === remainingAmount) {
    return await prisma.$transaction(async (tx) => {
      await invoiceModel.updateInvoice(id, { status: 'PAID' }, tx);
      return await paymentModel.createPayment(id, amount, tx);
    });
  }
  // if the amount is less than the remaining unpaid amount, create a new payment
  else {
    return await paymentModel.createPayment(id, amount);
  }
};

export {
  getInvoicesService,
  getInvoiceByIdService,
  createInvoiceService,
  payInvoiceService,
};
