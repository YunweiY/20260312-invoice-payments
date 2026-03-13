import validator from 'validator';
import { BadRequestError } from '../errors/AppError.js';

const parsePagination = (query) => {
  const { page, limit } = query;

  if (page && !validator.isInt(page, { min: 1 })) {
    throw BadRequestError('Page must be a positive integer', 'BAD_REQUEST');
  }
  if (limit && !validator.isInt(limit, { min: 1, max: 100 })) {
    throw BadRequestError(
      'Limit must be an integer between 1 and 100',
      'BAD_REQUEST'
    );
  }

  return {
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10,
  };
};

export default parsePagination;
