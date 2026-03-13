import express from 'express';
import * as customerController from '../controllers/customer.controllers.js';

const router = express.Router();

/**
 * @openapi
 * /customers:
 *   get:
 *     tags:
 *       - Customers
 *     summary: List all customers
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
 *         description: Customers returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomersListResponse'
 */
router.get('/', customerController.getCustomersController);
/**
 * @openapi
 * /customers/{id}/invoices:
 *   get:
 *     tags:
 *       - Customers
 *     summary: List invoices for one customer
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PENDING, PAID, VOID]
 *       - in: query
 *         name: from
 *         description: ISO 8601 date
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         description: ISO 8601 date
 *         schema:
 *           type: string
 *           format: date-time
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
 *         description: Invoices returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CustomerInvoicesResponse'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id/invoices', customerController.getCustomerInvoicesController);

export default router;
