import request from 'supertest';
import { describe, it, expect, afterAll } from '@jest/globals';
import app from '../../src/app.js';
import prisma from '../../src/config/prisma.js';

const VALID_STATUSES = ['DRAFT', 'PENDING', 'PAID', 'VOID'];

describe('GET /api/invoices', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('returns success response with invoice list shape', async () => {
    const response = await request(app).get('/api/invoices');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);

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
      expect(VALID_STATUSES).toContain(invoice.status);
    }
  });

  it('filters invoices by status', async () => {
    const response = await request(app)
      .get('/api/invoices')
      .query({ status: 'PENDING' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);

    for (const invoice of response.body.data) {
      expect(invoice.status).toBe('PENDING');
    }
  });

  it('filters invoices by issued_at date range', async () => {
    const from = '1900-01-01T00:00:00.000Z';
    const to = '2100-01-01T00:00:00.000Z';

    const response = await request(app)
      .get('/api/invoices')
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

  it('filters invoices by status and date range together', async () => {
    const from = '1900-01-01T00:00:00.000Z';
    const to = '2100-01-01T00:00:00.000Z';

    const response = await request(app)
      .get('/api/invoices')
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

  it('returns 400 for invalid status', async () => {
    const response = await request(app)
      .get('/api/invoices')
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
    const response = await request(app)
      .get('/api/invoices')
      .query({ from: 'not-a-date' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid from date',
      },
    });
  });

  it('returns 400 for invalid to date string', async () => {
    const response = await request(app)
      .get('/api/invoices')
      .query({ to: 'not-a-date' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid to date',
      },
    });
  });

  it('returns 400 when from date is after to date', async () => {
    const response = await request(app).get('/api/invoices').query({
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

  it('returns 400 when from is provided as a non-string type', async () => {
    const response = await request(app)
      .get('/api/invoices')
      .query({ from: ['2026-03-01', '2026-03-02'] });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'From date must be a string',
      },
    });
  });

  it('returns 400 when to is provided as a non-string type', async () => {
    const response = await request(app)
      .get('/api/invoices')
      .query({ to: ['2026-03-01', '2026-03-02'] });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'BAD_REQUEST',
        message: 'To date must be a string',
      },
    });
  });
});
