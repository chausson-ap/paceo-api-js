import pool from '../config/db.js';

const VU_COLS = `
  vu_id AS id,
  modele_id,
  contenu,
  ordre
`;

const UPDATABLE_COLUMNS = ['contenu', 'ordre'];

export const listByModele = async (modeleId) => {
  console.log('[model] modele_vu.listByModele:', modeleId);
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      `SELECT ${VU_COLS}
       FROM convention_modele_vus
       WHERE modele_id = ?
       ORDER BY ordre, vu_id`,
      [modeleId]
    );
    return rows;
  } finally {
    conn.release();
  }
};

export const getById = async (vuId) => {
  console.log('[model] modele_vu.getById:', vuId);
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      `SELECT ${VU_COLS}
       FROM convention_modele_vus
       WHERE vu_id = ?`,
      [vuId]
    );
    return rows[0] ?? null;
  } finally {
    conn.release();
  }
};

export const create = async ({ id, modeleId, contenu, ordre }) => {
  console.log('[model] modele_vu.create:', id, modeleId);
  const conn = await pool.getConnection();
  try {
    await conn.query(
      `INSERT INTO convention_modele_vus
        (vu_id, modele_id, contenu, ordre)
       VALUES (?, ?, ?, ?)`,
      [id, modeleId, contenu, ordre ?? 0]
    );
    return id;
  } finally {
    conn.release();
  }
};

export const update = async (vuId, data) => {
  const cols = UPDATABLE_COLUMNS.filter((k) => data[k] !== undefined);
  if (cols.length === 0) return 0;
  const sets = cols.map((k) => `${k} = ?`).join(', ');
  const values = cols.map((k) => data[k]);
  console.log('[model] modele_vu.update:', vuId, cols);
  const conn = await pool.getConnection();
  try {
    const res = await conn.query(
      `UPDATE convention_modele_vus SET ${sets} WHERE vu_id = ?`,
      [...values, vuId]
    );
    return res.affectedRows;
  } finally {
    conn.release();
  }
};

export const remove = async (vuId) => {
  console.log('[model] modele_vu.remove:', vuId);
  const conn = await pool.getConnection();
  try {
    const res = await conn.query(
      'DELETE FROM convention_modele_vus WHERE vu_id = ?',
      [vuId]
    );
    return res.affectedRows;
  } finally {
    conn.release();
  }
};

export const getMaxOrdre = async (modeleId) => {
  console.log('[model] modele_vu.getMaxOrdre:', modeleId);
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      'SELECT MAX(ordre) AS max_ordre FROM convention_modele_vus WHERE modele_id = ?',
      [modeleId]
    );
    const value = rows[0]?.max_ordre;
    return value == null ? -1 : Number(value);
  } finally {
    conn.release();
  }
};

export const bulkUpdateOrdre = async (modeleId, orderedIds) => {
  console.log('[model] modele_vu.bulkUpdateOrdre:', modeleId, orderedIds.length);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    try {
      // Vérifie que tous les ids appartiennent bien à ce modele
      if (orderedIds.length > 0) {
        const placeholders = orderedIds.map(() => '?').join(',');
        const rows = await conn.query(
          `SELECT vu_id FROM convention_modele_vus
           WHERE modele_id = ? AND vu_id IN (${placeholders})`,
          [modeleId, ...orderedIds]
        );
        if (rows.length !== orderedIds.length) {
          const err = new Error('Certains vus n\'appartiennent pas à ce modèle');
          err.status = 400;
          throw err;
        }
      }

      let affected = 0;
      for (let i = 0; i < orderedIds.length; i++) {
        const res = await conn.query(
          `UPDATE convention_modele_vus
           SET ordre = ?
           WHERE vu_id = ? AND modele_id = ?`,
          [i, orderedIds[i], modeleId]
        );
        affected += Number(res.affectedRows ?? 0);
      }

      await conn.commit();
      return affected;
    } catch (err) {
      await conn.rollback();
      throw err;
    }
  } finally {
    conn.release();
  }
};
