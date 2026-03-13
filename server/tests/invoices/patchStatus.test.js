import request from 'supertest';
import { describe, it, expect, afterAll } from '@jest/globals';
import app from '../../src/app.js';
import prisma from '../../src/config/prisma.js';

const NON_EXISTENT_INVOICE_ID = '00000000-0000-0000-0000-000000000000';

const getAnyCustomerId = async () => {
  const customer = await prisma.customers.findFirst({
    select: { id: true },
  });
  expect(customer).not.toBeNull();
  return customer.id;
};

const createInvoiceWithState = async ({ status = 'DRAFT', amount = 100 }) => {
  const customerId = await getAnyCustomerId();

  return prisma.invoices.create({
    data: {
      customer_id: customerId,
      amount,
      currency: 'USD',
      issued_at: new Date(),
      due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status,
    },
  });
};

describe('PATCH /api/invoices/:id/status', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('updates invoice status from DRAFT to PENDING', async () => {
    const invoice = await createInvoiceWithState({ status: 'DRAFT' });

    const response = await request(app)
      .patch(`/api/invoices/${invoice.id}/status`)
      .send({ status: 'PENDING' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: invoice.id,
        status: 'PENDING',
      })
    );
  });

  it('updates invoice status from DRAFT to VOID', async () => {
    const invoice = await createInvoiceWithState({ status: 'DRAFT' });

    const response = await request(app)
      .patch(`/api/invoices/${invoice.id}/status`)
      .send({ status: 'VOID' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: invoice.id,
        status: 'VOID',
      })
    );
  });

  it('updates invoice status from PENDING to VOID when invoice has no payments', async () => {
    const invoice = await createInvoiceWithState({ status: 'PENDING' });

    const response = await request(app)
      .patch(`/api/invoices/${invoice.id}/status`)
      .send({ status: 'VOID' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: invoice.id,
        status: 'VOID',
      })
    );
  });

  it('returns 400 when invoice id is not a valid UUID', async () => {
    const response = await request(app)
      .patch('/api/invoices/not-a-uuid/status')
      .send({ status: 'PENDING' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'Invoice ID must be a valid UUID',
      },
    });
  });

  it('returns 400 when target status is not PENDING or VOID', async () => {
    const invoice = await createInvoiceWithState({ status: 'DRAFT' });

    const response = await request(app)
      .patch(`/api/invoices/${invoice.id}/status`)
      .send({ status: 'PAID' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'Target status must be either PENDING or VOID',
      },
    });
  });

  it('returns 404 when invoice does not exist', async () => {
    const response = await request(app)
      .patch(`/api/invoices/${NON_EXISTENT_INVOICE_ID}/status`)
      .send({ status: 'VOID' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'NOT_FOUND',
        message: 'Invoice not found',
      },
    });
  });

  it('returns 400 when invoice is not in DRAFT or PENDING status', async () => {
    const invoice = await createInvoiceWithState({ status: 'PAID' });

    const response = await request(app)
      .patch(`/api/invoices/${invoice.id}/status`)
      .send({ status: 'VOID' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'Invoice is not in DRAFT or PENDING status, current status is PAID',
      },
    });
  });

  it('returns 400 when invoice is already PENDING and target status is PENDING', async () => {
    const invoice = await createInvoiceWithState({ status: 'PENDING' });

    const response = await request(app)
      .patch(`/api/invoices/${invoice.id}/status`)
      .send({ status: 'PENDING' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'Invoice is already PENDING',
      },
    });
  });

  it('returns 400 when pending invoice has payments and target status is VOID', async () => {
    const invoice = await createInvoiceWithState({ status: 'PENDING', amount: 100 });

    await prisma.payments.create({
      data: {
        invoice_id: invoice.id,
        amount: 10,
        paid_at: new Date(),
      },
    });

    const response = await request(app)
      .patch(`/api/invoices/${invoice.id}/status`)
      .send({ status: 'VOID' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'Invoice has payments and cannot be voided',
      },
    });
  });
});
