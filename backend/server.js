// backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// 1️⃣ Configure CORS to allow your GitHub Pages origin
//    and to include the x-access-key header in preflight responses.
const corsOptions = {
  origin: [ 
    'https://uday-sv.github.io',       // your GH Pages URL
    'https://vishnu-522257.github.io'  // (remove if not needed)
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'x-access-key'    // <-- allow this custom header through CORS
  ],
  // if you ever need to send cookies/auth, you can add:
  // credentials: true
};

app.use(cors(corsOptions));
// Ensure OPTIONS preflight is handled
app.options('*', cors(corsOptions));

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('Wedding Invitation Backend is running');
});

// 2️⃣ Config endpoint (v2)
//    If you want to serve /api/v2/config exactly like Undangan’s default:
app.get('/api/v2/config', (req, res) => {
  res.json({
    app_name:    'Wedding Invitation',
    app_version: '1.0.0',
    api_version: 'v2',
    status:      'success'
  });
});

// 3️⃣ Comments endpoints
app.get('/api/comments', async (req, res) => {
  try {
    const comments = await db.getComments();
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/comments', async (req, res) => {
  // Optional: verify x-access-key here if you’d like:
  const clientKey = req.header('x-access-key');
  if (clientKey !== process.env.API_KEY) {
    return res.status(401).json({ message: 'Invalid API key' });
  }

  const { name, message } = req.body;
  if (!name || !message) {
    return res.status(400).json({ message: 'Name & message required' });
  }

  try {
    const newComment = await db.addComment(name, message);
    res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
