import express from 'express';
import * as customerController from '../controllers/customer.controllers.js';

const router = express.Router();

router.get('/', customerController.getCustomersController);

export default router;
