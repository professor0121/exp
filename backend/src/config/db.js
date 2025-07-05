import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Pass the URL directly as a string
const db = neon(process.env.DATABASE_URL);

export default db;
