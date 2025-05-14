const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 5, // Reduced from 10
  maxIdle: 3, // Limit idle connections
  idleTimeout: 30000, // 30 seconds
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // 10 seconds
  resetConnectionOnError: true
});

// Test database connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database');
    connection.release();
    
    // Check if comments table exists, create it if not
    await createCommentsTableIfNotExists();
    
    // Add debug comment
    await addDebugComment();
    
    // Setup periodic health check
    setupConnectionHealthCheck();
  } catch (error) {
    console.error('Database connection error:', error);
  }
})();

// Validate connection before use
async function validateConnection() {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.ping();
    return true;
  } catch (err) {
    console.error('Connection validation failed:', err);
    return false;
  } finally {
    if (conn) conn.release();
  }
}

// Setup periodic health check to keep connections alive
function setupConnectionHealthCheck() {
  setInterval(async () => {
    try {
      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
      console.log('Connection health check: OK');
    } catch (err) {
      console.error('Connection health check failed:', err);
    }
  }, 30000); // Every 30 seconds
}

async function createCommentsTableIfNotExists() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Comments table checked/created successfully');
  } catch (error) {
    console.error('Error creating comments table:', error);
  }
}

async function addDebugComment() {
  try {
    // Check if debug comment already exists
    const [existing] = await pool.query('SELECT * FROM comments WHERE name = ? LIMIT 1', ['System']);
    if (existing.length === 0) {
      await pool.query(
        'INSERT INTO comments (name, message) VALUES (?, ?)',
        ['System', 'Welcome to our wedding invitation! Leave your wishes here.']
      );
      console.log('Debug comment added successfully');
    }
  } catch (error) {
    console.error('Error adding debug comment:', error);
  }
}

// Get comments with retry logic
async function getComments(retries = 3) {
  try {
    await validateConnection();
    const [rows] = await pool.query('SELECT * FROM comments ORDER BY created_at DESC');
    return rows;
  } catch (error) {
    if (error.code === 'ECONNRESET' && retries > 0) {
      console.log(`Connection reset, retrying... (${retries} attempts left)`);
      return getComments(retries - 1);
    }
    console.error('Error fetching comments:', error);
    throw error;
  }
}

// Add comment with retry logic
async function addComment(name, message, retries = 3) {
  try {
    await validateConnection();
    const [result] = await pool.query(
      'INSERT INTO comments (name, message) VALUES (?, ?)',
      [name, message]
    );
    return { 
      id: result.insertId, 
      name,
      message,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    if (error.code === 'ECONNRESET' && retries > 0) {
      console.log(`Connection reset, retrying... (${retries} attempts left)`);
      return addComment(name, message, retries - 1);
    }
    console.error('Error adding comment:', error);
    throw error;
  }
}

module.exports = { 
  getComments, 
  addComment, 
  addDebugComment,
  validateConnection
};
