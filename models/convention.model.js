import pool from '../config/db.js';

const CONVENTION_COLS = `
  c.convention_id AS id,
  c.structure_id,
  c.nom_unique,
  c.workflow_type,
  c.workflow,
  c.modele_id,
  c.type_action,
  c.dossier_id,
  c.code_activite,
  c.annee_conventionnement,
  c.date_debut,
  c.duree_annees,
  c.date_fin,
  c.signataire_structure_contact_id,
  c.signataire_structure_delegation,
  c.signataire_etat_agent_id,
  c.logo_piece_jointe_id
`;

const STRUCTURE_COLS = `
  s.denomination,
  s.nom_commercial,
  s.sigle,
  s.siret,
  s.etab_batiment,
  s.etab_voie,
  s.etab_complement,
  s.etab_code_postal,
  s.etab_commune
`;

const MODELE_COLS = `
  m.modele_id AS modele_fk_id,
  m.nom AS modele_nom
`;

const LOGO_COLS = `
  lpj.piece_jointe_id AS logo_pj_id,
  lpj.nom_original AS logo_nom_original,
  lpj.type_mime AS logo_type_mime,
  lpj.taille AS logo_taille
`;

export const listAll = async () => {
  console.log('[model] convention.listAll: before getConnection');
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      `SELECT ${CONVENTION_COLS},
              s.denomination, s.nom_commercial, s.sigle, s.siret,
              m.nom AS modele_nom
       FROM conventions c
       LEFT JOIN structures s ON s.structure_id = c.structure_id
       LEFT JOIN convention_modeles m ON m.modele_id = c.modele_id
       ORDER BY c.nom_unique`
    );
    console.log('[model] convention.listAll: rows:', rows.length);
    return rows;
  } finally {
    conn.release();
  }
};

export const getById = async (id) => {
  console.log('[model] convention.getById:', id);
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      `SELECT ${CONVENTION_COLS},
              ${STRUCTURE_COLS},
              ${MODELE_COLS},
              ${LOGO_COLS}
       FROM conventions c
       LEFT JOIN structures s ON s.structure_id = c.structure_id
       LEFT JOIN convention_modeles m ON m.modele_id = c.modele_id
       LEFT JOIN piece_jointes lpj ON lpj.piece_jointe_id = c.logo_piece_jointe_id
       WHERE c.convention_id = ?`,
      [id]
    );
    return rows[0] ?? null;
  } finally {
    conn.release();
  }
};

export const getByNomUnique = async (nom) => {
  console.log('[model] convention.getByNomUnique:', nom);
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      `SELECT ${CONVENTION_COLS},
              ${STRUCTURE_COLS},
              ${MODELE_COLS},
              ${LOGO_COLS}
       FROM conventions c
       LEFT JOIN structures s ON s.structure_id = c.structure_id
       LEFT JOIN convention_modeles m ON m.modele_id = c.modele_id
       LEFT JOIN piece_jointes lpj ON lpj.piece_jointe_id = c.logo_piece_jointe_id
       WHERE c.nom_unique = ?`,
      [nom]
    );
    return rows[0] ?? null;
  } finally {
    conn.release();
  }
};

const UPDATABLE_COLUMNS = [
  'nom_unique',
  'type_action',
  'code_activite',
  'annee_conventionnement',
  'date_debut',
  'duree_annees',
  'date_fin',
  'signataire_structure_contact_id',
  'signataire_structure_delegation',
  'signataire_etat_agent_id',
  'logo_piece_jointe_id',
];

export const update = async (id, data) => {
  const cols = UPDATABLE_COLUMNS.filter((k) => data[k] !== undefined);
  if (cols.length === 0) return 0;
  const sets = cols.map((k) => `${k} = ?`).join(', ');
  const values = cols.map((k) => data[k]);
  console.log('[model] convention.update:', id, cols);
  const conn = await pool.getConnection();
  try {
    const res = await conn.query(
      `UPDATE conventions SET ${sets} WHERE convention_id = ?`,
      [...values, id]
    );
    return res.affectedRows;
  } finally {
    conn.release();
  }
};
