import { BadRequestError } from '../errors/AppError.js';

const validStatuses = ['PENDING', 'PAID', 'VOID', 'DRAFT'];

const validateInvoiceStatus = (status) => {
  if (!validStatuses.includes(status)) {
    throw BadRequestError('Invalid status', 'BAD_REQUEST');
  }
};

export { validateInvoiceStatus };
