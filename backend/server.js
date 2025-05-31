const express = require('express');
const cors = require('cors');
const app = express();
const port = 5001;

// Enable CORS for all routes
app.use(cors());

app.use(express.json());

app.get('/api/mycats', (req, res) => {
  res.json([
    { id: 1, name: 'Bolt Baby' },
    { id: 2, name: 'Mochi Baby' },
    { id: 3, name: 'Yuna Baby' }
  ]);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
