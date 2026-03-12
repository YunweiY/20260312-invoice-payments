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

  it('returns 400 when customer id is not a valid UUID', async () => {
    const response = await request(app).get('/api/customers/not-a-uuid/invoices');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'Customer ID must be a valid UUID',
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
