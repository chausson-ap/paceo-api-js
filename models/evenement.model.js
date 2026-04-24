import pool from '../config/db.js';

export const listAll = async () => {
  console.log('[model] evenement.listAll: before getConnection');
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      'SELECT evenement_id AS id, titre, contenu, type, publie_le FROM evenements ORDER BY publie_le DESC'
    );
    console.log('[model] evenement.listAll: rows:', rows.length);
    return rows;
  } finally {
    conn.release();
  }
};
