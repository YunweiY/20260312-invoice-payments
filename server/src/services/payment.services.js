import * as paymentModel from '../models/payment.models.js';

const getPaymentsService = async () => {
  const payments = await paymentModel.getPayments();
  return payments;
};

export { getPaymentsService };
