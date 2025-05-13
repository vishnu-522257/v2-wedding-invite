const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '8lwl0.h.filess.io',
  user: 'vishnu_doneeight',
  password: '••••••••••••••••••••••••••••••••••••••••',  // Replace with your actual password
  database: 'vishnu_doneeight',
  port: 61002,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function getComments() {
  const [rows] = await pool.query('SELECT * FROM comments ORDER BY created_at DESC');
  return rows;
}

async function addComment(name, message) {
  const [result] = await pool.query('INSERT INTO comments (name, message) VALUES (?, ?)', [name, message]);
  return { id: result.insertId, name, message };
}

module.exports = { getComments, addComment };
