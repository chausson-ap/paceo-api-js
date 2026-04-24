import pool from '../config/db.js';

export const create = async ({ piece_jointe_id, nom_stocke, nom_original, type_mime, taille }) => {
  console.log('[model] piece_jointe.create:', piece_jointe_id);
  const conn = await pool.getConnection();
  try {
    await conn.query(
      'INSERT INTO piece_jointes (piece_jointe_id, nom_stocke, nom_original, type_mime, taille) VALUES (?, ?, ?, ?, ?)',
      [piece_jointe_id, nom_stocke, nom_original, type_mime, taille]
    );
    return piece_jointe_id;
  } finally {
    conn.release();
  }
};

export const getById = async (id) => {
  console.log('[model] piece_jointe.getById:', id);
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      'SELECT piece_jointe_id AS id, nom_stocke, nom_original, type_mime, taille, ajoute_le FROM piece_jointes WHERE piece_jointe_id = ?',
      [id]
    );
    return rows[0] ?? null;
  } finally {
    conn.release();
  }
};

export const remove = async (id) => {
  console.log('[model] piece_jointe.remove:', id);
  const conn = await pool.getConnection();
  try {
    const res = await conn.query(
      'DELETE FROM piece_jointes WHERE piece_jointe_id = ?',
      [id]
    );
    return res.affectedRows;
  } finally {
    conn.release();
  }
};

export const findStructureIdByPieceJointe = async (pieceJointeId) => {
  console.log('[model] piece_jointe.findStructureIdByPieceJointe:', pieceJointeId);
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      'SELECT structure_id FROM structure_ribs WHERE piece_jointe_id = ? LIMIT 1',
      [pieceJointeId]
    );
    return rows[0]?.structure_id ?? null;
  } finally {
    conn.release();
  }
};
