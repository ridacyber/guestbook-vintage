const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors());
app.use(express.json());

// GET all messages
app.get('/messages', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, message, created_at FROM messages ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// POST a new message
app.post('/messages', async (req, res) => {
  const { name, message } = req.body;
  const delete_token = crypto.randomBytes(32).toString('hex');
  try {
    const result = await pool.query(
      'INSERT INTO messages (name, message, delete_token) VALUES ($1, $2, $3) RETURNING id, name, message, created_at, delete_token',
      [name, message, delete_token]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// VERIFY admin password
app.delete('/messages/verify', (req, res) => {
  const { admin_password } = req.body;
  if (admin_password !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Invalid admin password' });
  }
  res.json({ success: true });
});

// DELETE a message
app.delete('/messages/:id', async (req, res) => {
  const { id } = req.params;
  const { delete_token, admin_password } = req.body;
  try {
    if (admin_password) {
      if (admin_password !== process.env.ADMIN_PASSWORD) {
        return res.status(403).json({ error: 'Invalid admin password' });
      }
      await pool.query('DELETE FROM messages WHERE id = $1', [id]);
      return res.json({ success: true });
    }
    const result = await pool.query(
      'DELETE FROM messages WHERE id = $1 AND delete_token = $2 RETURNING id',
      [id, delete_token]
    );
    if (result.rowCount === 0) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});