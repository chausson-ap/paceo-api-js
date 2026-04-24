import pool from '../config/db.js';

export const findUserByEmail = async (email) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query('SELECT user_id AS id, name, email, password_hash FROM users WHERE email = ?', [email]);
    return rows[0];
  } finally {
    conn.release();
  }
};

export const findUserById = async (id) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query('SELECT user_id AS id, name, email, password_hash FROM users WHERE user_id = ?', [id]);
    return rows[0];
  } finally {
    conn.release();
  }
};

export const createUser = async ({ id, name, email, password_hash }) => {
  console.log('[model] createUser:', email);
  const conn = await pool.getConnection();
  try {
    await conn.query(
      'INSERT INTO users (user_id, name, email, password_hash) VALUES (?, ?, ?, ?)',
      [id, name, email, password_hash]
    );
    return id;
  } finally {
    conn.release();
  }
};
