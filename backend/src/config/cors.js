import cors from 'cors';

// Basic configuration — adjust as needed
const corsOptions = {
  origin: '*', // Allow all origins; use specific domain in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const applyCors = cors(corsOptions);

export default applyCors;
