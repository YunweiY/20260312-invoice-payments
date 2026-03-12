import express from 'express';
import * as customerController from '../controllers/customer.controllers.js';

const router = express.Router();

router.get('/', customerController.getCustomersController);
router.get('/:id/invoices', customerController.getCustomerInvoicesController);

export default router;
