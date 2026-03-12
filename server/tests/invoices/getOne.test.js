import request from 'supertest';
import { describe, it, expect, afterAll } from '@jest/globals';
import app from '../../src/app.js';
import prisma from '../../src/config/prisma.js';

describe('GET /api/invoices/:id', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('returns invoice detail when invoice exists', async () => {
    const listResponse = await request(app).get('/api/invoices');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.status).toBe('success');
    expect(Array.isArray(listResponse.body.data)).toBe(true);
    expect(listResponse.body.data.length).toBeGreaterThan(0);

    const existingInvoiceId = listResponse.body.data[0].id;
    const response = await request(app).get(
      `/api/invoices/${existingInvoiceId}`
    );

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: existingInvoiceId,
        amount: expect.anything(),
        currency: expect.any(String),
        issued_at: expect.any(String),
        due_at: expect.any(String),
        status: expect.any(String),
        customer: expect.any(Object),
        payments: expect.any(Array),
      })
    );
  });

  it('returns 400 when invoice id length is invalid', async () => {
    const invalidInvoiceId = '123';

    const response = await request(app).get(
      `/api/invoices/${invalidInvoiceId}`
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'Invoice ID must be a valid UUID',
      },
    });
  });

  it('returns 404 when invoice is not found', async () => {
    const nonExistentInvoiceId = '00000000-0000-0000-0000-000000000000';

    const response = await request(app).get(
      `/api/invoices/${nonExistentInvoiceId}`
    );

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'NOT_FOUND',
        message: 'Invoice not found',
      },
    });
  });
});
