const commonSchemas = {
  PaginationMeta: {
    type: 'object',
    properties: {
      total: { type: 'integer', example: 42 },
      totalPages: { type: 'integer', example: 5 },
      currentPage: { type: 'integer', example: 1 },
      limit: { type: 'integer', example: 10 },
    },
    required: ['total', 'totalPages', 'currentPage', 'limit'],
  },
  SuccessResponse: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'success' },
      data: {},
    },
    required: ['status', 'data'],
  },
  ErrorResponse: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'error' },
      error: {
        type: 'object',
        properties: {
          code: { type: 'string', example: 'BAD_REQUEST' },
          message: {
            type: 'string',
            example: 'Invoice ID must be a valid UUID',
          },
        },
        required: ['code', 'message'],
      },
    },
    required: ['status', 'error'],
  },
};

export { commonSchemas };
