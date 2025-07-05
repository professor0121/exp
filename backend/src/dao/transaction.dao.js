import db from '../config/db.js';

export const createTransactionDAO = async ({ user_id, title, amount, category }) => {
  const result = await db`
    INSERT INTO transactions (user_id, title, amount, category)
    VALUES (${user_id}, ${title}, ${amount}, ${category})
    RETURNING *;
  `;

  return result[0];
};
