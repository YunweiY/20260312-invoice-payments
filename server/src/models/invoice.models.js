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

const getInvoiceById = async (id) => {
  const invoice = await prisma.invoices.findUnique({
    where: { id },
    include: {
      customer: true,
      payments: true,
    },
  });
  return invoice;
};

export { getInvoices, getInvoiceById };
