// custom error class
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace?.(this, this.constructor);
  }
}

export default AppError;

// specific error classes
export const BadRequestError = (message, code) =>
  new AppError(message, 400, code);
export const NotFoundError = (message, code) =>
  new AppError(message, 404, code);
