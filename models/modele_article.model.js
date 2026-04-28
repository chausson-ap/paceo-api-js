import pool from '../config/db.js';

const ARTICLE_COLS = `
  article_id AS id,
  modele_id,
  titre,
  contenu,
  ordre
`;

const UPDATABLE_COLUMNS = ['titre', 'contenu', 'ordre'];

export const listByModele = async (modeleId) => {
  console.log('[model] modele_article.listByModele:', modeleId);
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      `SELECT ${ARTICLE_COLS}
       FROM convention_modele_articles
       WHERE modele_id = ?
       ORDER BY ordre, article_id`,
      [modeleId]
    );
    return rows;
  } finally {
    conn.release();
  }
};

export const getById = async (articleId) => {
  console.log('[model] modele_article.getById:', articleId);
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      `SELECT ${ARTICLE_COLS}
       FROM convention_modele_articles
       WHERE article_id = ?`,
      [articleId]
    );
    return rows[0] ?? null;
  } finally {
    conn.release();
  }
};

export const create = async ({ id, modeleId, titre, contenu, ordre }) => {
  console.log('[model] modele_article.create:', id, modeleId);
  const conn = await pool.getConnection();
  try {
    await conn.query(
      `INSERT INTO convention_modele_articles
        (article_id, modele_id, titre, contenu, ordre)
       VALUES (?, ?, ?, ?, ?)`,
      [id, modeleId, titre, contenu, ordre ?? 0]
    );
    return id;
  } finally {
    conn.release();
  }
};

export const update = async (articleId, data) => {
  const cols = UPDATABLE_COLUMNS.filter((k) => data[k] !== undefined);
  if (cols.length === 0) return 0;
  const sets = cols.map((k) => `${k} = ?`).join(', ');
  const values = cols.map((k) => data[k]);
  console.log('[model] modele_article.update:', articleId, cols);
  const conn = await pool.getConnection();
  try {
    const res = await conn.query(
      `UPDATE convention_modele_articles SET ${sets} WHERE article_id = ?`,
      [...values, articleId]
    );
    return res.affectedRows;
  } finally {
    conn.release();
  }
};

export const remove = async (articleId) => {
  console.log('[model] modele_article.remove:', articleId);
  const conn = await pool.getConnection();
  try {
    const res = await conn.query(
      'DELETE FROM convention_modele_articles WHERE article_id = ?',
      [articleId]
    );
    return res.affectedRows;
  } finally {
    conn.release();
  }
};

export const getMaxOrdre = async (modeleId) => {
  console.log('[model] modele_article.getMaxOrdre:', modeleId);
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      'SELECT MAX(ordre) AS max_ordre FROM convention_modele_articles WHERE modele_id = ?',
      [modeleId]
    );
    const value = rows[0]?.max_ordre;
    return value == null ? -1 : Number(value);
  } finally {
    conn.release();
  }
};

export const bulkUpdateOrdre = async (modeleId, orderedIds) => {
  console.log('[model] modele_article.bulkUpdateOrdre:', modeleId, orderedIds.length);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    try {
      // Vérifie que tous les ids appartiennent bien à ce modele
      if (orderedIds.length > 0) {
        const placeholders = orderedIds.map(() => '?').join(',');
        const rows = await conn.query(
          `SELECT article_id FROM convention_modele_articles
           WHERE modele_id = ? AND article_id IN (${placeholders})`,
          [modeleId, ...orderedIds]
        );
        if (rows.length !== orderedIds.length) {
          const err = new Error('Certains articles n\'appartiennent pas à ce modèle');
          err.status = 400;
          throw err;
        }
      }

      let affected = 0;
      for (let i = 0; i < orderedIds.length; i++) {
        const res = await conn.query(
          `UPDATE convention_modele_articles
           SET ordre = ?
           WHERE article_id = ? AND modele_id = ?`,
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
