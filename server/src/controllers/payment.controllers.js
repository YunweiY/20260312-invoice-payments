import * as paymentService from '../services/payment.services.js';

const getPaymentsController = async (req, res, next) => {
  try {
    const payments = await paymentService.getPaymentsService();
    res.status(200).json({
      status: 'success',
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

export { getPaymentsController };
