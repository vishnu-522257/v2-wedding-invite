const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database');
    connection.release();
    
    // Check if comments table exists, create it if not
    await createCommentsTableIfNotExists();
  } catch (error) {
    console.error('Database connection error:', error);
  }
})();

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

async function getComments() {
  try {
    const [rows] = await pool.query('SELECT * FROM comments ORDER BY created_at DESC');
    return rows;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}

async function addComment(name, message) {
  try {
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
    console.error('Error adding comment:', error);
    throw error;
  }
}

module.exports = { getComments, addComment };
