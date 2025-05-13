const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS with specific options
const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-access-key', 'x-requested-with', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware with our options
app.use(cors(corsOptions));
app.use(express.json());

// Add middleware to set a valid Permissions-Policy header
app.use((req, res, next) => {
  // Set a Permissions-Policy with only recognized features
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), fullscreen=(self)'
  );
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Wedding Invitation Backend is running');
});

// Config endpoint
app.get('/api/v2/config', (req, res) => {
  res.json({
    app_name: "Wedding Invitation",
    app_version: "1.0.0",
    api_version: "v2",
    status: "success"
  });
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

// Handle RSVP endpoints (even though you're not using them, the frontend might request them)
app.get('/api/v2/rsvp', (req, res) => {
  res.json({ status: "success", data: [] });
});

app.post('/api/v2/rsvp', (req, res) => {
  res.json({ status: "success", message: "RSVP feature is disabled" });
});

// Handle other potential API endpoints that the frontend might request
app.get('/api/v2/comments', async (req, res) => {
  try {
    const comments = await db.getComments();
    res.json({ status: "success", data: comments });
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.post('/api/v2/comments', async (req, res) => {
  try {
    const { name, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ status: "error", message: 'Name and message are required' });
    }
    const newComment = await db.addComment(name, message);
    res.status(201).json({ status: "success", data: newComment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
