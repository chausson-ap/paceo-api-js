import pool from '../config/db.js';

export const listByConvention = async (conventionId) => {
  console.log('[model] convention_annexe.listByConvention:', conventionId);
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      `SELECT pj.piece_jointe_id AS id,
              pj.nom_original,
              pj.type_mime,
              pj.taille,
              ca.ordre
       FROM convention_annexes ca
       INNER JOIN piece_jointes pj ON pj.piece_jointe_id = ca.piece_jointe_id
       WHERE ca.convention_id = ?
       ORDER BY ca.ordre, pj.nom_original`,
      [conventionId]
    );
    return rows;
  } finally {
    conn.release();
  }
};

export const addAnnexe = async (conventionId, pieceJointeId, ordre) => {
  console.log('[model] convention_annexe.addAnnexe:', conventionId, pieceJointeId, ordre);
  const conn = await pool.getConnection();
  try {
    await conn.query(
      'INSERT INTO convention_annexes (convention_id, piece_jointe_id, ordre) VALUES (?, ?, ?)',
      [conventionId, pieceJointeId, ordre ?? 0]
    );
    return pieceJointeId;
  } finally {
    conn.release();
  }
};

export const getByPieceJointeId = async (pieceJointeId) => {
  console.log('[model] convention_annexe.getByPieceJointeId:', pieceJointeId);
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      `SELECT ca.convention_id,
              ca.piece_jointe_id,
              ca.ordre,
              pj.nom_stocke
       FROM convention_annexes ca
       INNER JOIN piece_jointes pj ON pj.piece_jointe_id = ca.piece_jointe_id
       WHERE ca.piece_jointe_id = ?`,
      [pieceJointeId]
    );
    return rows[0] ?? null;
  } finally {
    conn.release();
  }
};

export const removeByPieceJointeId = async (pieceJointeId) => {
  console.log('[model] convention_annexe.removeByPieceJointeId:', pieceJointeId);
  const conn = await pool.getConnection();
  try {
    const res = await conn.query(
      'DELETE FROM convention_annexes WHERE piece_jointe_id = ?',
      [pieceJointeId]
    );
    return res.affectedRows;
  } finally {
    conn.release();
  }
};

export const getMaxOrdre = async (conventionId) => {
  console.log('[model] convention_annexe.getMaxOrdre:', conventionId);
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      'SELECT MAX(ordre) AS max_ordre FROM convention_annexes WHERE convention_id = ?',
      [conventionId]
    );
    const value = rows[0]?.max_ordre;
    return value == null ? -1 : Number(value);
  } finally {
    conn.release();
  }
};
