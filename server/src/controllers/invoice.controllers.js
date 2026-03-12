import * as invoiceService from '../services/invoice.services.js';

const getInvoicesController = async (req, res, next) => {
  try {
    const invoices = await invoiceService.getInvoicesService();
    res.status(200).json({
      status: 'success',
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};

export { getInvoicesController };
