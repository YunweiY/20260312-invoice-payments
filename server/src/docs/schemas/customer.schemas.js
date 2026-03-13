const customerSchemas = {
  CustomerSummary: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string', example: 'Acme Corp' },
    },
    required: ['id', 'name'],
  },
  CustomersListResponse: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'success' },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/CustomerSummary' },
      },
      meta: { $ref: '#/components/schemas/PaginationMeta' },
    },
    required: ['status', 'data', 'meta'],
  },
  CustomerInvoicesResponse: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'success' },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/InvoiceListItem' },
      },
      meta: { $ref: '#/components/schemas/PaginationMeta' },
    },
    required: ['status', 'data', 'meta'],
  },
};

export { customerSchemas };
