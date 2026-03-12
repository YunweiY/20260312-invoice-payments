import * as invoiceService from '../services/invoice.services.js';
import { BadRequestError } from '../errors/AppError.js';

const getInvoicesController = async (req, res, next) => {
  try {
    const { status, from, to } = req.query;

    // validate status
    if (
      status &&
      status !== 'PENDING' &&
      status !== 'PAID' &&
      status !== 'VOID' &&
      status !== 'DRAFT'
    ) {
      throw BadRequestError('Invalid status', 'BAD_REQUEST');
    }

    // validate date range
    let fromDate;
    let toDate;

    if (from && typeof from !== 'string') {
      throw BadRequestError('From date must be a string', 'BAD_REQUEST');
    } else if (from) {
      fromDate = new Date(from);
      if (isNaN(fromDate)) {
        throw BadRequestError('Invalid from date', 'BAD_REQUEST');
      }
    }

    if (to && typeof to !== 'string') {
      throw BadRequestError('To date must be a string', 'BAD_REQUEST');
    } else if (to) {
      toDate = new Date(to);
      if (isNaN(toDate)) {
        throw BadRequestError('Invalid to date', 'BAD_REQUEST');
      }
    }

    if (fromDate && toDate && fromDate > toDate) {
      throw BadRequestError('From date must be before to date', 'BAD_REQUEST');
    }

    const invoices = await invoiceService.getInvoicesService(
      status,
      fromDate,
      toDate
    );

    res.status(200).json({
      status: 'success',
      data: invoices,
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
    if (typeof id !== 'string') {
      throw BadRequestError('Invoice ID must be a string', 'BAD_REQUEST');
    }
    if (id.length !== 36) {
      throw BadRequestError(
        'Invoice ID must be 36 characters long',
        'BAD_REQUEST'
      );
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

export { getInvoicesController, getInvoiceByIdController };
