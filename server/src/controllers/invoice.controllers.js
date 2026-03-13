import validator from 'validator';
import * as invoiceService from '../services/invoice.services.js';
import { BadRequestError } from '../errors/AppError.js';
import { validateInvoiceStatus } from '../utils/validateInvoiceStatus.js';
import { isValidAmountString } from '../utils/validateAmountString.js';
import parsePagination from '../utils/parsePagination.js';

const getInvoicesController = async (req, res, next) => {
  try {
    const { status, from, to } = req.query;
    const { page, limit } = parsePagination(req.query);

    // validate status
    if (status) {
      validateInvoiceStatus(status);
    }

    // validate date range
    if (from && !validator.isISO8601(from)) {
      throw BadRequestError(
        'From date must be a valid ISO 8601 date',
        'BAD_REQUEST'
      );
    }

    if (to && !validator.isISO8601(to)) {
      throw BadRequestError(
        'To date must be a valid ISO 8601 date',
        'BAD_REQUEST'
      );
    }

    const { invoices, total, totalPages } =
      await invoiceService.getInvoicesService(status, from, to, page, limit);

    res.status(200).json({
      status: 'success',
      data: invoices,
      meta: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getInvoiceByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;

    // validate invoice id
    if (!id) {
      throw BadRequestError('Invoice ID is required', 'BAD_REQUEST');
    }
    if (!validator.isUUID(id)) {
      throw BadRequestError('Invoice ID must be a valid UUID', 'BAD_REQUEST');
    }

    const invoice = await invoiceService.getInvoiceByIdService(id);

    res.status(200).json({
      status: 'success',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

const createInvoiceController = async (req, res, next) => {
  try {
    // issued_at is set to the current date and time by default
    const { customer_id, amount, currency, due_at } = req.body ?? {};

    // validate whether all required fields are provided
    // should not use !amount because 0 will be considered as falsy
    if (
      !customer_id ||
      amount === undefined ||
      amount === null ||
      !currency ||
      !due_at
    ) {
      throw BadRequestError(
        'Customer ID, amount, currency, and due date are required',
        'BAD_REQUEST'
      );
    }

    // validate whether customer_id is a valid UUID
    if (typeof customer_id !== 'string' || !validator.isUUID(customer_id)) {
      throw BadRequestError('Invalid customer ID', 'BAD_REQUEST');
    }

    // validate whether currency is a valid currency code
    if (!validator.isISO4217(currency)) {
      throw BadRequestError(
        'Currency must be a valid ISO 4217 currency code',
        'BAD_REQUEST'
      );
    }

    // validate whether due_at is a valid ISO 8601 date
    if (!validator.isISO8601(due_at)) {
      throw BadRequestError(
        'Due date must be a valid ISO 8601 date',
        'BAD_REQUEST'
      );
    }

    if (!isValidAmountString(amount)) {
      throw BadRequestError(
        'Amount must be a decimal string with up to 2 decimal places',
        'BAD_REQUEST'
      );
    }

    const invoice = await invoiceService.createInvoiceService(
      customer_id,
      amount,
      currency,
      due_at
    );

    res.status(201).json({
      status: 'success',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

const payInvoiceController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount } = req.body ?? {};

    // validate invoice id
    if (!id) {
      throw BadRequestError('Invoice ID is required', 'BAD_REQUEST');
    }
    if (!validator.isUUID(id)) {
      throw BadRequestError('Invoice ID must be a valid UUID', 'BAD_REQUEST');
    }

    // validate amount
    if (amount === undefined || amount === null) {
      throw BadRequestError('Amount is required', 'BAD_REQUEST');
    }
    if (!isValidAmountString(amount)) {
      throw BadRequestError(
        'Amount must be a decimal string with up to 2 decimal places',
        'BAD_REQUEST'
      );
    }

    const payment = await invoiceService.payInvoiceService(id, amount);

    res.status(200).json({
      status: 'success',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

const updateInvoiceStatusController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body ?? {};

    // validate invoice id
    if (!id) {
      throw BadRequestError('Invoice ID is required', 'BAD_REQUEST');
    }
    if (!validator.isUUID(id)) {
      throw BadRequestError('Invoice ID must be a valid UUID', 'BAD_REQUEST');
    }

    // validate status
    if (!['PENDING', 'VOID'].includes(status)) {
      throw BadRequestError(
        'Target status must be either PENDING or VOID',
        'BAD_REQUEST'
      );
    }

    const invoice = await invoiceService.updateInvoiceStatusService(id, status);

    res.status(200).json({
      status: 'success',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getInvoicesController,
  getInvoiceByIdController,
  createInvoiceController,
  payInvoiceController,
  updateInvoiceStatusController,
};
