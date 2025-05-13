const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS with specific options
const corsOptions = {
  origin: ['https://uday-sv.github.io', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-key', 'x-requested-with'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware with options
app.use(cors(corsOptions));

// Handle OPTIONS preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Wedding Invitation Backend is running');
});

// Get all comments
app.get('/api/comments', async (req, res) => {
  try {
    const comments = await db.getComments();
    res.json(comments);
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add a new comment
app.post('/api/comments', async (req, res) => {
  try {
    const { name, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ message: 'Name and message are required' });
    }
    const newComment = await db.addComment(name, message);
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add endpoint for config that the frontend is trying to access
app.get('/api/v2/config', (req, res) => {
  res.json({
    status: true,
    message: 'Config loaded successfully',
    data: {
      app_name: "Wedding Invitation",
      app_version: "1.0.0",
      comments_enabled: true
    }
  });
});

// Add endpoint for guests that the frontend might be trying to access
app.get('/api/v2/guests', (req, res) => {
  res.json({
    status: true,
    message: 'Guest list loaded successfully',
    data: []
  });
});

// Add endpoint for comments that matches the original API format
app.get('/api/v2/comments', async (req, res) => {
  try {
    const comments = await db.getComments();
    res.json({
      status: true,
      message: 'Comments loaded successfully',
      data: comments
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ 
      status: false,
      message: error.message,
      data: []
    });
  }
});

// Add endpoint for posting comments that matches the original API format
app.post('/api/v2/comments', async (req, res) => {
  try {
    const { name, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ 
        status: false,
        message: 'Name and message are required',
        data: null
      });
    }
    const newComment = await db.addComment(name, message);
    res.status(201).json({
      status: true,
      message: 'Comment added successfully',
      data: newComment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ 
      status: false,
      message: error.message,
      data: null
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
