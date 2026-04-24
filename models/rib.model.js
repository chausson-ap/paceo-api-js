import pool from '../config/db.js';

const SELECT_COLS = `
  r.rib_id AS id,
  r.structure_id,
  r.etablissement,
  r.domiciliation,
  r.guichet,
  r.titulaire,
  r.numero_compte,
  r.iban,
  r.code_bic,
  r.cle_rib,
  r.piece_jointe_id,
  pj.nom_original AS pj_nom_original,
  pj.type_mime AS pj_type_mime,
  pj.taille AS pj_taille
`;

const normalizeRow = (row) => {
  if (!row) return row;
  const {
    pj_nom_original,
    pj_type_mime,
    pj_taille,
    piece_jointe_id,
    ...rest
  } = row;
  const piece_jointe = piece_jointe_id
    ? {
        id: piece_jointe_id,
        nom_original: pj_nom_original,
        type_mime: pj_type_mime,
        taille: pj_taille,
      }
    : null;
  return { ...rest, piece_jointe_id, piece_jointe };
};

export const listByStructure = async (structureId) => {
  console.log('[model] rib.listByStructure:', structureId);
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      `SELECT ${SELECT_COLS}
       FROM structure_ribs r
       LEFT JOIN piece_jointes pj ON pj.piece_jointe_id = r.piece_jointe_id
       WHERE r.structure_id = ?
       ORDER BY r.titulaire`,
      [structureId]
    );
    console.log('[model] rib.listByStructure rows:', rows.length);
    return rows.map(normalizeRow);
  } finally {
    conn.release();
  }
};

export const getById = async (ribId) => {
  console.log('[model] rib.getById:', ribId);
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      `SELECT ${SELECT_COLS}
       FROM structure_ribs r
       LEFT JOIN piece_jointes pj ON pj.piece_jointe_id = r.piece_jointe_id
       WHERE r.rib_id = ?`,
      [ribId]
    );
    return normalizeRow(rows[0]);
  } finally {
    conn.release();
  }
};

export const create = async ({
  rib_id,
  structure_id,
  etablissement,
  domiciliation,
  guichet,
  titulaire,
  numero_compte,
  iban,
  code_bic,
  cle_rib,
  piece_jointe_id,
}) => {
  console.log('[model] rib.create:', rib_id);
  const conn = await pool.getConnection();
  try {
    await conn.query(
      `INSERT INTO structure_ribs
        (rib_id, structure_id, etablissement, domiciliation, guichet, titulaire,
         numero_compte, iban, code_bic, cle_rib, piece_jointe_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rib_id,
        structure_id,
        etablissement ?? '',
        domiciliation ?? '',
        guichet ?? '',
        titulaire ?? '',
        numero_compte ?? '',
        iban ?? '',
        code_bic ?? '',
        cle_rib ?? '',
        piece_jointe_id ?? null,
      ]
    );
    return rib_id;
  } finally {
    conn.release();
  }
};

const UPDATABLE_COLUMNS = [
  'etablissement',
  'domiciliation',
  'guichet',
  'titulaire',
  'numero_compte',
  'iban',
  'code_bic',
  'cle_rib',
  'piece_jointe_id',
];

export const update = async (ribId, data) => {
  const cols = UPDATABLE_COLUMNS.filter((k) => data[k] !== undefined);
  if (cols.length === 0) return 0;
  const sets = cols.map((k) => `${k} = ?`).join(', ');
  const values = cols.map((k) => data[k]);
  console.log('[model] rib.update:', ribId, cols);
  const conn = await pool.getConnection();
  try {
    const res = await conn.query(
      `UPDATE structure_ribs SET ${sets} WHERE rib_id = ?`,
      [...values, ribId]
    );
    return res.affectedRows;
  } finally {
    conn.release();
  }
};

export const remove = async (ribId) => {
  console.log('[model] rib.remove:', ribId);
  const conn = await pool.getConnection();
  try {
    const res = await conn.query(
      'DELETE FROM structure_ribs WHERE rib_id = ?',
      [ribId]
    );
    return res.affectedRows;
  } finally {
    conn.release();
  }
};
