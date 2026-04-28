import pool from '../config/db.js';

export const listAllStructures = async () => {
  console.log('[model] bo.structure.listAllStructures: before getConnection');
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      'SELECT structure_id AS id, denomination, nom_commercial, sigle, siret, siren, etab_code_postal, etab_commune, etab_telephone, etab_courriel FROM structures ORDER BY COALESCE(NULLIF(denomination, \'\'), nom_commercial) ASC'
    );
    console.log('[model] bo.structure.listAllStructures: rows:', rows.length);
    return rows;
  } finally {
    conn.release();
  }
};
