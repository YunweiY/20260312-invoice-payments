import prisma from '../config/prisma.js';

const getInvoices = async () => {
  const invoices = await prisma.invoices.findMany({
    select: {
      id: true,
      amount: true,
      currency: true,
      issued_at: true,
      due_at: true,
      status: true,
      customer: {
        select: {
          name: true,
        },
      },
    },
  });
  return invoices;
};

export { getInvoices };
