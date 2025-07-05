// src/controllers/transaction.controller.js
import { createTransactionService } from '../services/transaction.service.js';

import { asyncHandler } from '../utils/asyncHandler.js';

export const createTransaction = asyncHandler(async (req, res) => {
  const transaction = await createTransactionService(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Transaction created successfully',
    data: transaction,
  });
});
