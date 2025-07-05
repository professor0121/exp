// src/services/transaction.service.js
import { createTransactionDAO } from '../dao/transaction.dao.js';

export const createTransactionService = async (data) => {

  const { user_id, title, amount, category } = data;

  if (!user_id || !title || !amount || !category) {
    return Promise.reject(new Error('Missing required fields'));
  }

  const transaction = await createTransactionDAO({
    user_id,
    title,
    amount,
    category,
  });

  return transaction;
};
