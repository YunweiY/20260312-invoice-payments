import prisma from '../config/prisma.js';

const getCustomers = async () => {
  const customers = await prisma.customers.findMany();
  return customers;
};

export { getCustomers };
