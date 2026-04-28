import pool from '../config/db.js';

export const listAll = async () => {
  console.log('[model] modele.listAll: before getConnection');
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      'SELECT modele_id AS id, nom, type_modele FROM convention_modeles ORDER BY nom'
    );
    console.log('[model] modele.listAll: rows:', rows.length);
    return rows;
  } finally {
    conn.release();
  }
};

export const getById = async (id) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      'SELECT modele_id AS id, nom, type_modele FROM convention_modeles WHERE modele_id = ?',
      [id]
    );
    return rows[0];
  } finally {
    conn.release();
  }
};

export const create = async ({ id, nom, type_modele }) => {
  const conn = await pool.getConnection();
  try {
    await conn.query(
      'INSERT INTO convention_modeles (modele_id, nom, type_modele) VALUES (?, ?, ?)',
      [id, nom, type_modele]
    );
    return id;
  } finally {
    conn.release();
  }
};

export const update = async (id, data) => {
  const allowed = ['nom', 'type_modele'];
  const fields = [];
  const values = [];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return 0;
  values.push(id);
  const conn = await pool.getConnection();
  try {
    const res = await conn.query(
      `UPDATE convention_modeles SET ${fields.join(', ')} WHERE modele_id = ?`,
      values
    );
    return res.affectedRows;
  } finally {
    conn.release();
  }
};

export const remove = async (id) => {
  const conn = await pool.getConnection();
  try {
    const res = await conn.query(
      'DELETE FROM convention_modeles WHERE modele_id = ?',
      [id]
    );
    return res.affectedRows;
  } finally {
    conn.release();
  }
};
