import prisma from '../config/prisma.js';

const getPayments = async () => {
  const payments = await prisma.payments.findMany();
  return payments;
};

const createPayment = async (invoice_id, amount, tx = prisma) => {
  const payment = await tx.payments.create({
    data: { invoice_id, amount, paid_at: new Date() },
  });
  return payment;
};

export { getPayments, createPayment };
