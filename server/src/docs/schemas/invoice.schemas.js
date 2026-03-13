const invoiceSchemas = {
  InvoicePaymentCount: {
    type: 'object',
    properties: {
      payments: { type: 'integer', example: 2 },
    },
    required: ['payments'],
  },
  InvoiceListItemCustomer: {
    type: 'object',
    properties: {
      name: { type: 'string', example: 'Acme Corp' },
    },
    required: ['name'],
  },
  InvoiceListItem: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      amount: { type: 'string', example: '150.00' },
      currency: { type: 'string', example: 'USD' },
      issued_at: { type: 'string', format: 'date-time' },
      due_at: { type: 'string', format: 'date-time' },
      status: { type: 'string', enum: ['DRAFT', 'PENDING', 'PAID', 'VOID'] },
      customer: { $ref: '#/components/schemas/InvoiceListItemCustomer' },
      _count: { $ref: '#/components/schemas/InvoicePaymentCount' },
    },
    required: [
      'id',
      'amount',
      'currency',
      'issued_at',
      'due_at',
      'status',
      'customer',
      '_count',
    ],
  },
  PaymentItem: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      invoice_id: { type: 'string', format: 'uuid' },
      amount: { type: 'string', example: '50.00' },
      paid_at: { type: 'string', format: 'date-time' },
    },
    required: ['id', 'invoice_id', 'amount', 'paid_at'],
  },
  InvoiceDetail: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      customer_id: { type: 'string', format: 'uuid' },
      amount: { type: 'string', example: '150.00' },
      currency: { type: 'string', example: 'USD' },
      issued_at: { type: 'string', format: 'date-time' },
      due_at: { type: 'string', format: 'date-time' },
      status: { type: 'string', enum: ['DRAFT', 'PENDING', 'PAID', 'VOID'] },
      remaining_amount: { type: 'string', example: '40.00' },
      customer: { $ref: '#/components/schemas/CustomerSummary' },
      payments: {
        type: 'array',
        items: { $ref: '#/components/schemas/PaymentItem' },
      },
    },
    required: [
      'id',
      'customer_id',
      'amount',
      'currency',
      'issued_at',
      'due_at',
      'status',
      'remaining_amount',
      'customer',
      'payments',
    ],
  },
  InvoicesListResponse: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'success' },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/InvoiceListItem' },
      },
    },
    required: ['status', 'data'],
  },
  InvoiceDetailResponse: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'success' },
      data: { $ref: '#/components/schemas/InvoiceDetail' },
    },
    required: ['status', 'data'],
  },
  CreateInvoiceRequest: {
    type: 'object',
    properties: {
      customer_id: {
        type: 'string',
        format: 'uuid',
        example: '11111111-1111-1111-1111-111111111111',
      },
      amount: { type: 'string', example: '150.00' },
      currency: { type: 'string', example: 'USD' },
      due_at: {
        type: 'string',
        format: 'date-time',
        example: '2026-12-31T00:00:00.000Z',
      },
    },
    required: ['customer_id', 'amount', 'currency', 'due_at'],
  },
  CreatePaymentRequest: {
    type: 'object',
    properties: {
      amount: { type: 'string', example: '50.00' },
    },
    required: ['amount'],
  },
  UpdateInvoiceStatusRequest: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['PENDING', 'VOID'],
        example: 'VOID',
      },
    },
    required: ['status'],
  },
};

export { invoiceSchemas };
