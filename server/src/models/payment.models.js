import prisma from '../config/prisma.js';

const getPayments = async (invoice_id, tx = prisma) => {
  let where = {};
  if (invoice_id) {
    where.invoice_id = invoice_id;
  }
  const payments = await tx.payments.findMany({
    where,
    include: {
      invoice: {
        select: {
          currency: true,
        },
      },
    },
  });
  return payments;
};

const createPayment = async (invoice_id, amount, tx = prisma) => {
  const payment = await tx.payments.create({
    data: { invoice_id, amount, paid_at: new Date() },
  });
  return payment;
};

export { getPayments, createPayment };
