const mysql = require('mysql2/promise');

// Encoded password: each character is +1 ASCII from actual password
const encodedPassword = 'your_encoded_password_here'; // e.g., if real is 'test123', store 'uftu234'

// Decode password by subtracting 1 ASCII value per character
function decodePassword(encoded) {
  return encoded
    .split('')
    .map(char => String.fromCharCode(char.charCodeAt(0) - 1))
    .join('');
}

const pool = mysql.createPool({
  host: '8lwl0.h.filess.io',
  user: 'vishnu_doneeight',
  password: decodePassword(encodedPassword),
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
  const [result] = await pool.query(
    'INSERT INTO comments (name, message) VALUES (?, ?)',
    [name, message]
  );
  return { id: result.insertId, name, message };
}

module.exports = { getComments, addComment };
