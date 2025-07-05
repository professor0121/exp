import db from '../config/db.js';

export const transactionsTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE
      );
    `);
    console.log("Database Initialization Successfull");
  } catch (error) {
    console.error("Error While initializing database", error);
  }
}