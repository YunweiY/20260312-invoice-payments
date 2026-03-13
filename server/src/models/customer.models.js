import prisma from '../config/prisma.js';

const getCustomers = async (page, limit) => {
  const customers = await prisma.customers.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      name: 'asc',
    },
  });
  const total = await prisma.customers.count();
  return { customers, total };
};

const getCustomerById = async (id) => {
  const customer = await prisma.customers.findUnique({
    where: { id },
  });
  return customer;
};

export { getCustomers, getCustomerById };
