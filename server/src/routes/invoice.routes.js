import express from 'express';
import * as invoiceController from '../controllers/invoice.controllers.js';

const router = express.Router();

router.get('/', invoiceController.getInvoicesController);
router.get('/:id', invoiceController.getInvoiceByIdController);
router.post('/', invoiceController.createInvoiceController);
router.post('/:id/payments', invoiceController.payInvoiceController);
router.patch('/:id/status', invoiceController.updateInvoiceStatusController);

export default router;
