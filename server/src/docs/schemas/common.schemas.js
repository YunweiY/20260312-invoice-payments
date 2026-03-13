const commonSchemas = {
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
