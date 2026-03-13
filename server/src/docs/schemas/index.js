import { commonSchemas } from './common.schemas.js';
import { customerSchemas } from './customer.schemas.js';
import { invoiceSchemas } from './invoice.schemas.js';
import { paymentSchemas } from './payment.schemas.js';

const schemas = {
  ...commonSchemas,
  ...customerSchemas,
  ...invoiceSchemas,
  ...paymentSchemas,
};

export { schemas };
