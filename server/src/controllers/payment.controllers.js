import * as paymentService from '../services/payment.services.js';
import parsePagination from '../utils/parsePagination.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getPaymentsController = asyncHandler(async (req, res, next) => {
  const { page, limit } = parsePagination(req.query);
  const { payments, total, totalPages } =
    await paymentService.getPaymentsService(page, limit);
  res.status(200).json({
    status: 'success',
    data: payments,
    meta: {
      total,
      totalPages,
      currentPage: page,
      limit,
    },
  });
});

export { getPaymentsController };
