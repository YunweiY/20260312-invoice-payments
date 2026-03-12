import prisma from '../config/prisma.js';

const getPayments = async () => {
  const payments = await prisma.payments.findMany();
  return payments;
};

export { getPayments };
