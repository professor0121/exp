import express from 'express';
import { transactionsTable } from './dao/config.dao.js';
import transactionRoutes from './routes/transection.route.js';
import applyCors from './config/cors.js';
import globalErrorHandler from './utils/error.util.js';

const app = express();

// Middleware
app.use(express.json());
app.use(applyCors);


transactionsTable();
// Routes
app.use((req, res, next) => {
  console.log(`${req.method} request for '${req.originalUrl}'`);
  next();
})
app.use('/api/transactions', transactionRoutes);
app.get('/', (req, res) => {
  res.send('Hello from ES6 app.js!');
});

app.use(globalErrorHandler);

export default app;
