import prisma from '../config/prisma.js';

const getCustomers = async () => {
  const customers = await prisma.customers.findMany();
  return customers;
};

const getCustomerById = async (id) => {
  const customer = await prisma.customers.findUnique({
    where: { id },
  });
  return customer;
};

export { getCustomers, getCustomerById };
