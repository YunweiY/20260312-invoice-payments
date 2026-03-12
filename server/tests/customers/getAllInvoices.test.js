import request from 'supertest';
import { describe, it, expect, afterAll } from '@jest/globals';
import app from '../../src/app.js';
import prisma from '../../src/config/prisma.js';

const NON_EXISTENT_CUSTOMER_ID = '00000000-0000-0000-0000-000000000000';
const createdCustomerIds = [];

describe('GET /api/customers/:id/invoices', () => {
  afterAll(async () => {
    if (createdCustomerIds.length > 0) {
      await prisma.customers.deleteMany({
        where: { id: { in: createdCustomerIds } },
      });
    }
    await prisma.$disconnect();
  });

  it('returns invoices for a customer with existing invoices', async () => {
    const invoiceWithCustomer = await prisma.invoices.findFirst({
      select: {
        customer_id: true,
        customer: {
          select: {
            name: true,
          },
        },
      },
    });

    expect(invoiceWithCustomer).not.toBeNull();

    const response = await request(app).get(
      `/api/customers/${invoiceWithCustomer.customer_id}/invoices`
    );

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);

    for (const invoice of response.body.data) {
      expect(invoice).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          amount: expect.anything(),
          currency: expect.any(String),
          issued_at: expect.any(String),
          due_at: expect.any(String),
          status: expect.any(String),
          customer: expect.objectContaining({
            name: expect.any(String),
          }),
        })
      );

      expect(invoice.customer.name).toBe(invoiceWithCustomer.customer.name);
    }
  });

  it('filters invoices by status for a customer', async () => {
    const invoiceWithCustomer = await prisma.invoices.findFirst({
      select: { customer_id: true },
    });
    expect(invoiceWithCustomer).not.toBeNull();

    const response = await request(app)
      .get(`/api/customers/${invoiceWithCustomer.customer_id}/invoices`)
      .query({ status: 'PENDING' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);

    for (const invoice of response.body.data) {
      expect(invoice.status).toBe('PENDING');
    }
  });

  it('filters invoices by issued_at date range for a customer', async () => {
    const invoiceWithCustomer = await prisma.invoices.findFirst({
      select: { customer_id: true },
    });
    expect(invoiceWithCustomer).not.toBeNull();

    const from = '1900-01-01T00:00:00.000Z';
    const to = '2100-01-01T00:00:00.000Z';

    const response = await request(app)
      .get(`/api/customers/${invoiceWithCustomer.customer_id}/invoices`)
      .query({ from, to });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);

    const fromMs = new Date(from).getTime();
    const toMs = new Date(to).getTime();

    for (const invoice of response.body.data) {
      const issuedAtMs = new Date(invoice.issued_at).getTime();
      expect(issuedAtMs).toBeGreaterThanOrEqual(fromMs);
      expect(issuedAtMs).toBeLessThanOrEqual(toMs);
    }
  });

  it('filters invoices by status and date range together for a customer', async () => {
    const invoiceWithCustomer = await prisma.invoices.findFirst({
      select: { customer_id: true },
    });
    expect(invoiceWithCustomer).not.toBeNull();

    const from = '1900-01-01T00:00:00.000Z';
    const to = '2100-01-01T00:00:00.000Z';

    const response = await request(app)
      .get(`/api/customers/${invoiceWithCustomer.customer_id}/invoices`)
      .query({ status: 'PAID', from, to });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);

    const fromMs = new Date(from).getTime();
    const toMs = new Date(to).getTime();

    for (const invoice of response.body.data) {
      const issuedAtMs = new Date(invoice.issued_at).getTime();
      expect(invoice.status).toBe('PAID');
      expect(issuedAtMs).toBeGreaterThanOrEqual(fromMs);
      expect(issuedAtMs).toBeLessThanOrEqual(toMs);
    }
  });

  it('returns 400 when customer id is not a valid UUID', async () => {
    const response = await request(app).get(
      '/api/customers/not-a-uuid/invoices'
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'Customer ID must be a valid UUID',
      },
    });
  });

  it('returns 400 for invalid status', async () => {
    const invoiceWithCustomer = await prisma.invoices.findFirst({
      select: { customer_id: true },
    });
    expect(invoiceWithCustomer).not.toBeNull();

    const response = await request(app)
      .get(`/api/customers/${invoiceWithCustomer.customer_id}/invoices`)
      .query({ status: 'INVALID' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid status',
      },
    });
  });

  it('returns 400 for invalid from date string', async () => {
    const invoiceWithCustomer = await prisma.invoices.findFirst({
      select: { customer_id: true },
    });
    expect(invoiceWithCustomer).not.toBeNull();

    const response = await request(app)
      .get(`/api/customers/${invoiceWithCustomer.customer_id}/invoices`)
      .query({ from: 'not-a-date' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'From date must be a valid ISO 8601 date',
      },
    });
  });

  it('returns 400 for invalid to date string', async () => {
    const invoiceWithCustomer = await prisma.invoices.findFirst({
      select: { customer_id: true },
    });
    expect(invoiceWithCustomer).not.toBeNull();

    const response = await request(app)
      .get(`/api/customers/${invoiceWithCustomer.customer_id}/invoices`)
      .query({ to: 'not-a-date' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'To date must be a valid ISO 8601 date',
      },
    });
  });

  it('returns 400 when from date is after to date', async () => {
    const invoiceWithCustomer = await prisma.invoices.findFirst({
      select: { customer_id: true },
    });
    expect(invoiceWithCustomer).not.toBeNull();

    const response = await request(app)
      .get(`/api/customers/${invoiceWithCustomer.customer_id}/invoices`)
      .query({
        from: '2026-04-01T00:00:00.000Z',
        to: '2026-03-01T00:00:00.000Z',
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'From date must be before to date',
      },
    });
  });

  it('returns success with empty list for non-existent customer id', async () => {
    const response = await request(app).get(
      `/api/customers/${NON_EXISTENT_CUSTOMER_ID}/invoices`
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: [],
    });
  });

  it('returns success with empty list for existing customer without invoices', async () => {
    const newCustomer = await prisma.customers.create({
      data: {
        name: `No Invoice Customer ${Date.now()}`,
      },
      select: {
        id: true,
      },
    });
    createdCustomerIds.push(newCustomer.id);

    const response = await request(app).get(
      `/api/customers/${newCustomer.id}/invoices`
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: [],
    });
  });
});
