import express from 'express';

import {transactionsTable} from './dao/config.dao.js';


const app = express();

// Middleware
app.use(express.json());


transactionsTable();
// Routes
app.get('/', (req, res) => {
  res.send('Hello from ES6 app.js!');
});

export default app;
