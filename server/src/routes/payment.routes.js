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
 *     parameters:
 *       - in: query
 *         name: page
 *         description: Page number (1-based)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: Items per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
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
