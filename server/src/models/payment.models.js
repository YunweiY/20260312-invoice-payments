import prisma from '../config/prisma.js';

const getPayments = async (invoice_id, page, limit, tx = prisma) => {
  let where = {};
  if (invoice_id) {
    where.invoice_id = invoice_id;
  }
  let skip = undefined;
  let take = undefined;
  if (page && limit && page > 0 && limit > 0) {
    skip = (page - 1) * limit;
    take = limit;
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
    skip,
    take,
    orderBy: {
      paid_at: 'desc',
    },
  });
  const total = await tx.payments.count({
    where,
  });
  return { payments, total };
};

const createPayment = async (invoice_id, amount, tx = prisma) => {
  const payment = await tx.payments.create({
    data: { invoice_id, amount, paid_at: new Date() },
  });
  return payment;
};

export { getPayments, createPayment };
