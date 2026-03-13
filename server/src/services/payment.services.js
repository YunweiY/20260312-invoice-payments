import * as paymentModel from '../models/payment.models.js';

const getPaymentsService = async (page, limit) => {
  const { payments, total } = await paymentModel.getPayments(null, page, limit);
  const totalPages = Math.ceil(total / limit);
  return { payments, total, totalPages };
};

export { getPaymentsService };
