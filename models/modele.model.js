import pool from '../config/db.js';

export const listAll = async () => {
  console.log('[model] modele.listAll: before getConnection');
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      'SELECT modele_id AS id, nom FROM convention_modeles ORDER BY nom'
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
      'SELECT modele_id AS id, nom FROM convention_modeles WHERE modele_id = ?',
      [id]
    );
    return rows[0];
  } finally {
    conn.release();
  }
};

export const create = async ({ id, nom }) => {
  const conn = await pool.getConnection();
  try {
    await conn.query(
      'INSERT INTO convention_modeles (modele_id, nom) VALUES (?, ?)',
      [id, nom]
    );
    return id;
  } finally {
    conn.release();
  }
};

export const update = async (id, { nom }) => {
  const conn = await pool.getConnection();
  try {
    const res = await conn.query(
      'UPDATE convention_modeles SET nom = ? WHERE modele_id = ?',
      [nom, id]
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
