import request from 'supertest';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { NotFoundError } from '../../src/errors/AppError.js';

const invoiceServiceMock = {
  getInvoicesService: jest.fn(),
  getInvoiceByIdService: jest.fn(),
};

jest.unstable_mockModule(
  '../../src/services/invoice.services.js',
  () => invoiceServiceMock
);

const { default: app } = await import('../../src/app.js');

describe('GET /api/invoices/:id', () => {
  const validInvoiceId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns invoice detail when invoice exists', async () => {
    const invoice = {
      id: validInvoiceId,
      amount: 1250.5,
      currency: 'USD',
      status: 'PENDING',
      customer: {
        id: '63f0dc56-c969-429f-9fd7-2d08ff42280f',
        name: 'Acme Corp',
      },
      payments: [
        {
          id: 'bdfb913c-657d-4a56-9254-43b288e66e44',
          amount: 400,
          paid_at: '2026-03-12T12:00:00.000Z',
        },
      ],
    };

    invoiceServiceMock.getInvoiceByIdService.mockResolvedValue(invoice);

    const response = await request(app).get(`/api/invoices/${validInvoiceId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: invoice,
    });
    expect(invoiceServiceMock.getInvoiceByIdService).toHaveBeenCalledWith(
      validInvoiceId
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
        message: 'Invoice ID must be 36 characters long',
      },
    });
    expect(invoiceServiceMock.getInvoiceByIdService).not.toHaveBeenCalled();
  });

  it('returns 404 when invoice is not found', async () => {
    invoiceServiceMock.getInvoiceByIdService.mockRejectedValue(
      NotFoundError('Invoice not found', 'NOT_FOUND')
    );

    const response = await request(app).get(`/api/invoices/${validInvoiceId}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'NOT_FOUND',
        message: 'Invoice not found',
      },
    });
  });

  it('returns 500 when an unexpected error occurs', async () => {
    invoiceServiceMock.getInvoiceByIdService.mockRejectedValue(
      new Error('Database unavailable')
    );

    const response = await request(app).get(`/api/invoices/${validInvoiceId}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong',
      },
    });
  });
});
