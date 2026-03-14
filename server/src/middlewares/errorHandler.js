import { Prisma } from '@prisma/client';
import AppError from '../errors/AppError.js';

// global error handler
export function errorHandler(err, req, res, next) {
  void next;

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
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2003') {
      // foreign key violation
      // e.g. customer got deleted after the check and before invoice is created
      return res.status(409).json({
        status: 'error',
        error: {
          code: 'PRISMA_FOREIGN_KEY_VIOLATION',
          message: 'Referenced resource does not exist',
        },
      });
    } else if (err.code === 'P2002') {
      // unique constraint violation
      // e.g. invoice with the same customer and amount already exists
      // this is not a problem in our case because we are creating a new invoice
      // but it's good to handle it anyway
      return res.status(409).json({
        status: 'error',
        error: {
          code: 'PRISMA_UNIQUE_CONSTRAINT_VIOLATION',
          message: 'Resource already exists',
        },
      });
    } else {
      //other Prisma client known request errors
      return res.status(500).json({
        status: 'error',
        error: {
          code: 'PRISMA_' + err.code,
          message: err.message,
        },
      });
    }
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
