import pool from '../config/db.js';

export const listStructuresForUser = async (userId) => {
  console.log('[model] listStructuresForUser:', userId);
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      `SELECT s.structure_id AS id, s.siret, s.siren, s.nom_commercial, s.sigle, s.denomination,
              s.numero_rna, s.registre_date, s.registre_volume, s.registre_folio, s.registre_tribunal_instance,
              s.etab_batiment, s.etab_voie, s.etab_complement, s.etab_code_postal, s.etab_commune,
              s.etab_commune_deleguee, s.etab_courriel, s.etab_telephone, s.etab_site_internet,
              s.gest_batiment, s.gest_voie, s.gest_complement, s.gest_code_postal, s.gest_commune,
              s.gest_commune_deleguee, s.gest_courriel, s.gest_telephone, s.gest_site_internet,
              us.role
       FROM structures s
       INNER JOIN user_structures us ON us.structure_id = s.structure_id
       WHERE us.user_id = ?`,
      [userId]
    );
    return rows;
  } finally {
    conn.release();
  }
};

export const linkUserStructure = async (userId, structureId, role = 'member', conn = null) => {
  const c = conn || await pool.getConnection();
  try {
    await c.query(
      'INSERT INTO user_structures (user_id, structure_id, role) VALUES (?, ?, ?)',
      [userId, structureId, role]
    );
  } finally {
    if (!conn) c.release();
  }
};

export const findRole = async (userId, structureId) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      'SELECT role FROM user_structures WHERE user_id = ? AND structure_id = ?',
      [userId, structureId]
    );
    return rows[0]?.role ?? null;
  } finally {
    conn.release();
  }
};
