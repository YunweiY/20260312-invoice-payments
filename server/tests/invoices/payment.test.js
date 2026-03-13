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

const createInvoiceWithState = async ({ status = 'PENDING', amount = 100 }) => {
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

describe('POST /api/invoices/:id/payments', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates a payment for a pending invoice when amount is valid', async () => {
    const invoice = await createInvoiceWithState({
      status: 'PENDING',
      amount: 100,
    });

    const response = await request(app)
      .post(`/api/invoices/${invoice.id}/payments`)
      .send({ amount: '40' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        invoice_id: invoice.id,
        amount: expect.anything(),
        paid_at: expect.any(String),
      })
    );
  });

  it('marks invoice as PAID when payment equals remaining amount', async () => {
    const invoice = await createInvoiceWithState({
      status: 'PENDING',
      amount: 120,
    });

    await prisma.payments.create({
      data: {
        invoice_id: invoice.id,
        amount: 20,
        paid_at: new Date(),
      },
    });

    const response = await request(app)
      .post(`/api/invoices/${invoice.id}/payments`)
      .send({ amount: '100' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');

    const updatedInvoice = await prisma.invoices.findUnique({
      where: { id: invoice.id },
      select: { status: true },
    });
    expect(updatedInvoice?.status).toBe('PAID');
  });

  it('returns 400 when invoice id is not a valid UUID', async () => {
    const response = await request(app)
      .post('/api/invoices/not-a-uuid/payments')
      .send({ amount: '10' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'Invoice ID must be a valid UUID',
      },
    });
  });

  it('returns 400 when amount is missing', async () => {
    const invoice = await createInvoiceWithState({
      status: 'PENDING',
      amount: 100,
    });

    const response = await request(app)
      .post(`/api/invoices/${invoice.id}/payments`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'Amount is required',
      },
    });
  });

  it('returns 400 when amount is null', async () => {
    const invoice = await createInvoiceWithState({
      status: 'PENDING',
      amount: 100,
    });

    const response = await request(app)
      .post(`/api/invoices/${invoice.id}/payments`)
      .send({ amount: null });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'Amount is required',
      },
    });
  });

  it('returns 404 when invoice does not exist', async () => {
    const response = await request(app)
      .post(`/api/invoices/${NON_EXISTENT_INVOICE_ID}/payments`)
      .send({ amount: '10' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'NOT_FOUND',
        message: 'Invoice not found',
      },
    });
  });

  it('returns 400 when amount is not positive', async () => {
    const invoice = await createInvoiceWithState({
      status: 'PENDING',
      amount: 100,
    });

    const response = await request(app)
      .post(`/api/invoices/${invoice.id}/payments`)
      .send({ amount: '0' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'Amount must be a positive number',
      },
    });
  });

  it('returns 400 when invoice is not in PENDING status', async () => {
    const invoice = await createInvoiceWithState({
      status: 'DRAFT',
      amount: 100,
    });

    const response = await request(app)
      .post(`/api/invoices/${invoice.id}/payments`)
      .send({ amount: '10' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'Invoice is not pending, current status is DRAFT',
      },
    });
  });

  it('returns 400 when amount is greater than remaining unpaid amount', async () => {
    const invoice = await createInvoiceWithState({
      status: 'PENDING',
      amount: 100,
    });

    await prisma.payments.create({
      data: {
        invoice_id: invoice.id,
        amount: 30,
        paid_at: new Date(),
      },
    });

    const response = await request(app)
      .post(`/api/invoices/${invoice.id}/payments`)
      .send({ amount: '80' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message:
          'Amount is greater than the remaining unpaid amount, remaining amount is 70.00',
      },
    });
  });

  it('returns 400 when amount format is invalid', async () => {
    const invoice = await createInvoiceWithState({
      status: 'PENDING',
      amount: 100,
    });

    const response = await request(app)
      .post(`/api/invoices/${invoice.id}/payments`)
      .send({ amount: '1.234' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'Amount must be a decimal string with up to 2 decimal places',
      },
    });
  });

  it('handles concurrent payments safely when total equals invoice amount', async () => {
    const invoice = await createInvoiceWithState({
      status: 'PENDING',
      amount: 100,
    });

    const [res1, res2] = await Promise.all([
      request(app)
        .post(`/api/invoices/${invoice.id}/payments`)
        .send({ amount: '50' }),
      request(app)
        .post(`/api/invoices/${invoice.id}/payments`)
        .send({ amount: '50' }),
    ]);

    expect([res1.status, res2.status].sort()).toEqual([200, 200]);

    const [updatedInvoice, payments] = await Promise.all([
      prisma.invoices.findUnique({
        where: { id: invoice.id },
        select: { status: true, amount: true },
      }),
      prisma.payments.findMany({
        where: { invoice_id: invoice.id },
        select: { amount: true },
      }),
    ]);

    const totalPaid = payments.reduce((sum, payment) => {
      return sum + Number(payment.amount);
    }, 0);

    expect(payments).toHaveLength(2);
    expect(totalPaid).toBe(100);
    expect(updatedInvoice?.status).toBe('PAID');
  });

  it('prevents overpayment under concurrent requests', async () => {
    const invoice = await createInvoiceWithState({
      status: 'PENDING',
      amount: 100,
    });

    const [res1, res2] = await Promise.all([
      request(app)
        .post(`/api/invoices/${invoice.id}/payments`)
        .send({ amount: '70' }),
      request(app)
        .post(`/api/invoices/${invoice.id}/payments`)
        .send({ amount: '40' }),
    ]);

    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([200, 400]);

    const payments = await prisma.payments.findMany({
      where: { invoice_id: invoice.id },
      select: { amount: true },
    });
    const totalPaid = payments.reduce((sum, payment) => {
      return sum + Number(payment.amount);
    }, 0);

    expect(totalPaid).toBeLessThanOrEqual(100);
    expect(payments).toHaveLength(1);
  });
});
