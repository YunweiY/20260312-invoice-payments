import prisma from '../config/prisma.js';

const getInvoices = async (status, fromDate, toDate) => {
  // build conditional filter object for status and issued_at date range
  const where = {};

  if (status) {
    where.status = status;
  }

  if (fromDate || toDate) {
    where.issued_at = {};
    if (fromDate) {
      where.issued_at.gte = fromDate;
    }
    if (toDate) {
      where.issued_at.lte = toDate;
    }
  }

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
    where,
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
