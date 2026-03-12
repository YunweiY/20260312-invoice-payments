import request from 'supertest';
import { describe, it, expect, afterAll } from '@jest/globals';
import app from '../../src/app.js';
import prisma from '../../src/config/prisma.js';

const buildFutureISODate = (days = 7) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const getValidCustomerId = async () => {
  const response = await request(app).get('/api/customers');

  expect(response.status).toBe(200);
  expect(response.body.status).toBe('success');
  expect(Array.isArray(response.body.data)).toBe(true);
  expect(response.body.data.length).toBeGreaterThan(0);

  return response.body.data[0].id;
};

describe('POST /api/invoices', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates a new invoice when payload is valid', async () => {
    const customerId = await getValidCustomerId();

    const payload = {
      customer_id: customerId,
      amount: 100,
      currency: 'USD',
      due_at: buildFutureISODate(10),
    };

    const response = await request(app).post('/api/invoices').send(payload);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        customer_id: payload.customer_id,
        amount: expect.anything(),
        currency: payload.currency,
        status: 'DRAFT',
      })
    );

    expect(new Date(response.body.data.due_at).toISOString()).toBe(
      new Date(payload.due_at).toISOString()
    );
  });

  it('returns 400 when required fields are missing', async () => {
    const response = await request(app).post('/api/invoices').send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'Customer ID, amount, currency, and due date are required',
      },
    });
  });

  it('returns 400 for invalid customer id format', async () => {
    const response = await request(app)
      .post('/api/invoices')
      .send({
        customer_id: '123',
        amount: 100,
        currency: 'USD',
        due_at: buildFutureISODate(10),
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid customer ID',
      },
    });
  });

  it('returns 400 for invalid currency code', async () => {
    const customerId = await getValidCustomerId();

    const response = await request(app)
      .post('/api/invoices')
      .send({
        customer_id: customerId,
        amount: 100,
        currency: 'USDT',
        due_at: buildFutureISODate(10),
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'Currency must be a valid ISO 4217 currency code',
      },
    });
  });

  it('returns 400 for invalid due date format', async () => {
    const customerId = await getValidCustomerId();

    const response = await request(app).post('/api/invoices').send({
      customer_id: customerId,
      amount: 100,
      currency: 'USD',
      due_at: '2026-13-40',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'Due date must be a valid ISO 8601 date',
      },
    });
  });

  it('returns 400 when amount is not positive', async () => {
    const customerId = await getValidCustomerId();

    const response = await request(app)
      .post('/api/invoices')
      .send({
        customer_id: customerId,
        amount: 0,
        currency: 'USD',
        due_at: buildFutureISODate(10),
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'Amount must be a positive number',
      },
    });
  });

  it('returns 400 when due date is not in the future', async () => {
    const customerId = await getValidCustomerId();

    const response = await request(app)
      .post('/api/invoices')
      .send({
        customer_id: customerId,
        amount: 100,
        currency: 'USD',
        due_at: new Date('2000-01-01T00:00:00.000Z').toISOString(),
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'Due date must be in the future',
      },
    });
  });

  it('returns 404 when customer does not exist', async () => {
    const response = await request(app)
      .post('/api/invoices')
      .send({
        customer_id: '00000000-0000-0000-0000-000000000000',
        amount: 100,
        currency: 'USD',
        due_at: buildFutureISODate(10),
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'NOT_FOUND',
        message: 'Customer not found',
      },
    });
  });
});
