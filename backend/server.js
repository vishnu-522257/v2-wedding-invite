const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-access-key', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Wedding Invitation Backend is running');
});

// Config endpoint - matches the original API
app.get('/api/v2/config', (req, res) => {
  res.json({
    app_name: "Wedding Invitation",
    app_version: "1.0.0",
    api_version: "v2",
    status: "success"
  });
});

// Get all comments
app.get('/api/v2/comment', async (req, res) => {
  try {
    const comments = await db.getComments();
    res.json({
      status: "success",
      data: comments
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Add a new comment
app.post('/api/v2/comment', async (req, res) => {
  try {
    const { name, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ status: "error", message: 'Name and message are required' });
    }
    const newComment = await db.addComment(name, message);
    res.status(201).json({
      status: "success",
      data: newComment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Handle greeting/wishes (if needed)
app.get('/api/v2/greeting', async (req, res) => {
  try {
    const comments = await db.getComments();
    res.json({
      status: "success",
      data: comments
    });
  } catch (error) {
    console.error('Error getting greetings:', error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.post('/api/v2/greeting', async (req, res) => {
  try {
    const { name, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ status: "error", message: 'Name and message are required' });
    }
    const newComment = await db.addComment(name, message);
    res.status(201).json({
      status: "success",
      data: newComment
    });
  } catch (error) {
    console.error('Error adding greeting:', error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
