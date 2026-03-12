import * as customerService from '../services/customer.services.js';

const getCustomersController = async (req, res, next) => {
  try {
    const customers = await customerService.getCustomersService();
    res.status(200).json({
      status: 'success',
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

export { getCustomersController };
