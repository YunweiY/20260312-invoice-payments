import * as customerService from '../services/customer.services.js';
import { BadRequestError } from '../errors/AppError.js';
import validator from 'validator';
import { validateInvoiceStatus } from '../utils/validateInvoiceStatus.js';
import parsePagination from '../utils/parsePagination.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getCustomersController = asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const { customers, total, totalPages } =
    await customerService.getCustomersService(page, limit);
  res.status(200).json({
    status: 'success',
    data: customers,
    meta: {
      total,
      totalPages,
      currentPage: page,
      limit,
    },
  });
});

const getCustomerInvoicesController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, from, to } = req.query;
  const { page, limit } = parsePagination(req.query);

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

  const { invoices, total, totalPages } =
    await customerService.getCustomerInvoicesService(
      id,
      status,
      from,
      to,
      page,
      limit
    );

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
});

export { getCustomersController, getCustomerInvoicesController };
