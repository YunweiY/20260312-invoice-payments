import express from 'express';
import * as paymentController from '../controllers/payment.controllers.js';

const router = express.Router();

/**
 * @openapi
 * /payments:
 *   get:
 *     tags:
 *       - Payments
 *     summary: List all payments
 *     responses:
 *       200:
 *         description: Payments returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentsListResponse'
 */
router.get('/', paymentController.getPaymentsController);

export default router;
