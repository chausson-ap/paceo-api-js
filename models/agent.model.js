import pool from '../config/db.js';

export const findByEmail = async (email) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      'SELECT agent_id AS id, nom, email, password_hash FROM agents WHERE email = ?',
      [email]
    );
    return rows[0];
  } finally {
    conn.release();
  }
};

export const findById = async (id) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      'SELECT agent_id AS id, nom, email, password_hash FROM agents WHERE agent_id = ?',
      [id]
    );
    return rows[0];
  } finally {
    conn.release();
  }
};

export const create = async ({ id, nom, email, password_hash }) => {
  console.log('[model] createAgent:', email);
  const conn = await pool.getConnection();
  try {
    await conn.query(
      'INSERT INTO agents (agent_id, nom, email, password_hash) VALUES (?, ?, ?, ?)',
      [id, nom, email, password_hash]
    );
    return id;
  } finally {
    conn.release();
  }
};
