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

// Database health check endpoint
app.get('/health', async (req, res) => {
  try {
    const isConnected = await db.validateConnection();
    if (isConnected) {
      res.json({ status: 'healthy', database: 'connected' });
    } else {
      res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
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

// Also add a non-versioned config endpoint
app.get('/api/config', (req, res) => {
  res.json({
    app_name: "Wedding Invitation",
    app_version: "1.0.0",
    api_version: "v2",
    status: "success"
  });
});

// Wedding config endpoint
app.get('/api/wedding-config', (req, res) => {
  res.json({
    title: "Our Wedding",
    bride: "Bride Name",
    groom: "Groom Name",
    date: "2024-01-01",
    time: "09:30:00",
    venue: "Wedding Venue",
    status: "success"
  });
});

// Original v2 API endpoints
app.get('/api/v2/comment', async (req, res) => {
  try {
    const comments = await db.getComments();
    res.json({
      status: "success",
      data: comments.length > 0 ? comments : [
        {
          id: 0,
          name: "System",
          message: "Welcome to our wedding invitation! Leave your wishes here.",
          created_at: new Date().toISOString()
        }
      ]
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ 
      status: "error", 
      message: error.message || "Failed to retrieve comments" 
    });
  }
});

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
    res.status(500).json({ 
      status: "error", 
      message: error.message || "Failed to add comment" 
    });
  }
});

// Handle greeting/wishes (if needed)
app.get('/api/v2/greeting', async (req, res) => {
  try {
    const comments = await db.getComments();
    res.json({
      status: "success",
      data: comments.length > 0 ? comments : [
        {
          id: 0,
          name: "System",
          message: "Welcome to our wedding invitation! Leave your wishes here.",
          created_at: new Date().toISOString()
        }
      ]
    });
  } catch (error) {
    console.error('Error getting greetings:', error);
    res.status(500).json({ 
      status: "error", 
      message: error.message || "Failed to retrieve greetings" 
    });
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
    res.status(500).json({ 
      status: "error", 
      message: error.message || "Failed to add greeting" 
    });
  }
});

// Updated endpoint to match what the frontend expects
app.get('/api/comments', async (req, res) => {
  try {
    const comments = await db.getComments();
    // If there are no comments, return a default comment
    if (comments.length === 0) {
      return res.json([
        {
          id: 0,
          name: "System",
          message: "Welcome to our wedding invitation! Leave your wishes here.",
          created_at: new Date().toISOString()
        }
      ]);
    }
    // Return just the array of comments
    res.json(comments);
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ message: error.message || "Failed to retrieve comments" });
  }
});

app.post('/api/comments', async (req, res) => {
  try {
    const { name, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ message: 'Name and message are required' });
    }
    const newComment = await db.addComment(name, message);
    // Return just the comment object
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: error.message || "Failed to add comment" });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
