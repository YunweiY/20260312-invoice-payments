import * as customerModel from '../models/customer.models.js';

const getCustomersService = async () => {
  const customers = await customerModel.getCustomers();
  return customers;
};

export { getCustomersService };
