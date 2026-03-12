import { Prisma } from '@prisma/client';
import AppError from '../errors/AppError.js';

// global error handler
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // handle Prisma client known request errors
  // foreign key violation
  // e.g. customer got deleted after the check and before invoice is created
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2003'
  ) {
    return res.status(409).json({
      status: 'error',
      error: {
        code: 'FOREIGN_KEY_VIOLATION',
        message: 'Referenced resource does not exist',
      },
    });
  }
  // unique constraint violation
  // e.g. invoice with the same customer and amount already exists
  // this is not a problem in our case because we are creating a new invoice
  // but it's good to handle it anyway
  if (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2002'
  ) {
    return res.status(409).json({
      status: 'error',
      error: {
        code: 'UNIQUE_CONSTRAINT_VIOLATION',
        message: 'Resource already exists',
      },
    });
  }

  console.error(err);

  return res.status(500).json({
    status: 'error',
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong',
    },
  });
}
