const express = require('express');
const cors = require('cors');
const app = express();
const port = 5001;

// Enable CORS with specific options
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/api/mycats', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json([
    { id: 1, name: 'Bolt Baby' },
    { id: 2, name: 'Mochi Baby' },
    { id: 3, name: 'Yuna Baby' }
  ]);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
