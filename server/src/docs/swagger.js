import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { env } from '../config/env.js';
import { schemas } from './schemas/index.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '20260312-invoice-payments',
      version: '1.0.0',
      description: 'API documentation for the Invoice System.',
    },
    servers: [
      {
        url: `http://localhost:${env.port}/api`,
        description: 'Local server',
      },
    ],
    components: {
      schemas,
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
