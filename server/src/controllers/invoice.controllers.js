import * as invoiceService from '../services/invoice.services.js';
import { BadRequestError } from '../errors/AppError.js';

const getInvoicesController = async (req, res, next) => {
  try {
    const invoices = await invoiceService.getInvoicesService();
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
