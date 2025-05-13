const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS with specific options
app.use(cors({
  origin: '*', // Allow all origins for now
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

// Parse JSON request body
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Wedding Invitation Backend is running');
});

// API v2 config endpoint (needed by the frontend)
app.get('/api/v2/config', (req, res) => {
  res.json({
    app_name: "Wedding Invitation",
    app_version: "1.0.0",
    api_version: "v2",
    status: "success"
  });
});

// API v2 comments endpoint
app.get('/api/v2/comments', async (req, res) => {
  try {
    const comments = await db.getComments();
    res.json({
      status: "success",
      data: comments
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  }
});

// Add a new comment
app.post('/api/v2/comments', async (req, res) => {
  try {
    const { name, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ 
        status: "error", 
        message: 'Name and message are required' 
      });
    }
    const newComment = await db.addComment(name, message);
    res.status(201).json({
      status: "success",
      data: newComment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  }
});

// Legacy API endpoints for compatibility
app.get('/api/comments', async (req, res) => {
  try {
    const comments = await db.getComments();
    res.json(comments);
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ message: error.message });
  }
});

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

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ 
    status: "error", 
    message: 'Endpoint not found' 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
