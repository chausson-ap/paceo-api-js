import pool from '../config/db.js';

const toBool = (v) => (v === null || v === undefined ? false : Boolean(Number(v)));

const normalizeRow = (row) => {
  if (!row) return row;
  return { ...row, correspondant_gestion: toBool(row.correspondant_gestion) };
};

export const listByStructure = async (structureId) => {
  console.log('[model] contact.listByStructure:', structureId);
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      'SELECT contact_id AS id, structure_id, prenom, nom, fonction, telephone, courriel, role, correspondant_gestion FROM structure_contacts WHERE structure_id = ? ORDER BY nom, prenom',
      [structureId]
    );
    console.log('[model] contact.listByStructure: rows:', rows.length);
    return rows.map(normalizeRow);
  } finally {
    conn.release();
  }
};

export const getById = async (contactId) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      'SELECT contact_id AS id, structure_id, prenom, nom, fonction, telephone, courriel, role, correspondant_gestion FROM structure_contacts WHERE contact_id = ?',
      [contactId]
    );
    return normalizeRow(rows[0]);
  } finally {
    conn.release();
  }
};

export const create = async ({
  id,
  structure_id,
  prenom,
  nom,
  fonction,
  telephone,
  courriel,
  role,
  correspondant_gestion,
}) => {
  const conn = await pool.getConnection();
  try {
    await conn.query(
      'INSERT INTO structure_contacts (contact_id, structure_id, prenom, nom, fonction, telephone, courriel, role, correspondant_gestion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        structure_id,
        prenom,
        nom,
        fonction ?? '',
        telephone ?? '',
        courriel ?? '',
        role,
        correspondant_gestion ?? 0,
      ]
    );
    return id;
  } finally {
    conn.release();
  }
};

const UPDATABLE_COLUMNS = [
  'prenom',
  'nom',
  'fonction',
  'telephone',
  'courriel',
  'role',
  'correspondant_gestion',
];

export const update = async (contactId, data) => {
  const cols = UPDATABLE_COLUMNS.filter((k) => data[k] !== undefined);
  if (cols.length === 0) return 0;
  const sets = cols.map((k) => `${k} = ?`).join(', ');
  const values = cols.map((k) => data[k]);
  const conn = await pool.getConnection();
  try {
    const res = await conn.query(
      `UPDATE structure_contacts SET ${sets} WHERE contact_id = ?`,
      [...values, contactId]
    );
    return res.affectedRows;
  } finally {
    conn.release();
  }
};

export const remove = async (contactId) => {
  const conn = await pool.getConnection();
  try {
    const res = await conn.query(
      'DELETE FROM structure_contacts WHERE contact_id = ?',
      [contactId]
    );
    return res.affectedRows;
  } finally {
    conn.release();
  }
};
