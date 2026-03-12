import express from 'express';
import * as paymentController from '../controllers/payment.controllers.js';

const router = express.Router();

router.get('/', paymentController.getPaymentsController);

export default router;
