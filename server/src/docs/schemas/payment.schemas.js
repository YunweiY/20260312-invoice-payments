const paymentSchemas = {
  PaymentsListItem: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      invoice_id: { type: 'string', format: 'uuid' },
      amount: { type: 'string', example: '50.00' },
      paid_at: { type: 'string', format: 'date-time' },
      invoice: {
        type: 'object',
        properties: {
          currency: { type: 'string', example: 'USD' },
        },
        required: ['currency'],
      },
    },
    required: ['id', 'invoice_id', 'amount', 'paid_at', 'invoice'],
  },
  PaymentsListResponse: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'success' },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/PaymentsListItem' },
      },
      meta: { $ref: '#/components/schemas/PaginationMeta' },
    },
    required: ['status', 'data', 'meta'],
  },
};

export { paymentSchemas };
