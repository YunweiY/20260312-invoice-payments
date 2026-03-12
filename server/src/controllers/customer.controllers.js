import * as customerService from '../services/customer.services.js';
import { BadRequestError } from '../errors/AppError.js';
import validator from 'validator';
import { validateInvoiceStatus } from '../utils/validateInvoiceStatus.js';

const getCustomersController = async (req, res, next) => {
  try {
    const customers = await customerService.getCustomersService();
    res.status(200).json({
      status: 'success',
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

const getCustomerInvoicesController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, from, to } = req.query;

    // validate customer id
    if (!id) {
      throw BadRequestError('Customer ID is required', 'BAD_REQUEST');
    }
    if (!validator.isUUID(id)) {
      throw BadRequestError('Customer ID must be a valid UUID', 'BAD_REQUEST');
    }

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

    const invoices = await customerService.getCustomerInvoicesService(
      id,
      status,
      from,
      to
    );

    res.status(200).json({
      status: 'success',
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};

export { getCustomersController, getCustomerInvoicesController };
