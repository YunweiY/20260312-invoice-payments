import * as customerService from '../services/customer.services.js';
import { BadRequestError } from '../errors/AppError.js';
import validator from 'validator';

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
    // validate customer id
    if (!id) {
      throw BadRequestError('Customer ID is required', 'BAD_REQUEST');
    }
    if (!validator.isUUID(id)) {
      throw BadRequestError('Customer ID must be a valid UUID', 'BAD_REQUEST');
    }

    const invoices = await customerService.getCustomerInvoicesService(id);

    res.status(200).json({
      status: 'success',
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};

export { getCustomersController, getCustomerInvoicesController };
