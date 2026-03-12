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

  const invoices = await invoiceModel.getInvoices(
    null,
    status,
    fromDate,
    toDate
  );
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
  if (typeof amount !== 'number' || amount <= 0) {
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
  if (typeof amount !== 'number' || amount <= 0) {
    throw BadRequestError('Amount must be a positive number', 'BAD_REQUEST');
  }

  // if two requests are sent at the same time, the second request should be blocked before the
  // first request is completed
  // we should apply a lock to the invoice to prevent concurrent requests to pay the same invoice
  return await prisma.$transaction(async (tx) => {
    // lock the invoice
    const invoice =
      await tx.$queryRaw`SELECT * FROM "Invoices" WHERE id = ${id} FOR UPDATE`;
    if (invoice.length === 0) {
      throw NotFoundError('Invoice not found', 'NOT_FOUND');
    }

    // validate the status of the invoice
    if (invoice[0].status !== 'PENDING') {
      throw BadRequestError(
        `Invoice is not pending, current status is ${invoice[0].status}`,
        'BAD_REQUEST'
      );
    }

    // get all payments for the invoice
    const payments = await paymentModel.getPayments(id, tx);

    // calculate the total paid amount
    const totalPaid = payments.reduce(
      (acc, payment) => acc + Number(payment.amount),
      0
    );
    const remainingAmount = Number(invoice[0].amount) - totalPaid;

    if (amount > remainingAmount) {
      // if the amount is greater than the remaining unpaid amount, throw an error
      throw BadRequestError(
        `Amount is greater than the remaining unpaid amount, remaining amount is ${remainingAmount}`,
        'BAD_REQUEST'
      );
    } else if (Number(amount) === remainingAmount) {
      // if the amount is equal to the remaining unpaid amount, update the invoice status to PAID and create a payment
      await invoiceModel.updateInvoice(id, { status: 'PAID' }, tx);
      const payment = await paymentModel.createPayment(id, amount, tx);
      return payment;
    } else {
      // if the amount is less than the remaining unpaid amount, only create the payment
      const payment = await paymentModel.createPayment(id, amount, tx);
      return payment;
    }
  });
};

export {
  getInvoicesService,
  getInvoiceByIdService,
  createInvoiceService,
  payInvoiceService,
};
