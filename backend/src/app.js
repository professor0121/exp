import express from 'express';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Hello from ES6 app.js!');
});

export default app;
