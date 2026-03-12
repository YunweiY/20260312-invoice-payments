import express from 'express';
import * as invoiceController from '../controllers/invoice.controllers.js';

const router = express.Router();

router.get('/', invoiceController.getInvoicesController);
router.get('/:id', invoiceController.getInvoiceByIdController);

export default router;
