import express from 'express';
import * as invoiceController from '../controllers/invoice.controllers.js';

const router = express.Router();

/**
 * @openapi
 * /invoices:
 *   get:
 *     tags:
 *       - Invoices
 *     summary: List invoices
 *     parameters:
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
 *     responses:
 *       200:
 *         description: Invoices returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvoicesListResponse'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', invoiceController.getInvoicesController);
/**
 * @openapi
 * /invoices/{id}:
 *   get:
 *     tags:
 *       - Invoices
 *     summary: Get one invoice by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Invoice returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InvoiceDetailResponse'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Invoice not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', invoiceController.getInvoiceByIdController);
/**
 * @openapi
 * /invoices:
 *   post:
 *     tags:
 *       - Invoices
 *     summary: Create a new invoice
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInvoiceRequest'
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', invoiceController.createInvoiceController);
/**
 * @openapi
 * /invoices/{id}/payments:
 *   post:
 *     tags:
 *       - Invoices
 *     summary: Record a payment for an invoice
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentRequest'
 *     responses:
 *       200:
 *         description: Payment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid input or business rule violation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Invoice not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/payments', invoiceController.payInvoiceController);
/**
 * @openapi
 * /invoices/{id}/status:
 *   patch:
 *     tags:
 *       - Invoices
 *     summary: Update invoice status
 *     description: Allowed target statuses are PENDING and VOID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateInvoiceStatusRequest'
 *     responses:
 *       200:
 *         description: Invoice status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid input or invalid transition
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Invoice not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id/status', invoiceController.updateInvoiceStatusController);

export default router;
