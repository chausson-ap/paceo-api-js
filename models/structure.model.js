import { randomUUID } from 'crypto';
import pool from '../config/db.js';

export const getAll = async () => {
  console.log('[model] getAll: before getConnection');
  const conn = await pool.getConnection();
  console.log('[model] getAll: got conn');
  try {
    const rows = await conn.query('SELECT structure_id AS id, siret, siren, nom_commercial, sigle, denomination, numero_rna, registre_date, registre_volume, registre_folio, registre_tribunal_instance, etab_batiment, etab_voie, etab_complement, etab_code_postal, etab_commune, etab_commune_deleguee, etab_courriel, etab_telephone, etab_site_internet, gest_batiment, gest_voie, gest_complement, gest_code_postal, gest_commune, gest_commune_deleguee, gest_courriel, gest_telephone, gest_site_internet FROM structures');
    console.log('[model] getAll: query done, rows:', rows.length);
    return rows;
  } finally {
    conn.release();
  }
};

export const getById = async (id) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query('SELECT structure_id AS id, siret, siren, nom_commercial, sigle, denomination, numero_rna, registre_date, registre_volume, registre_folio, registre_tribunal_instance, etab_batiment, etab_voie, etab_complement, etab_code_postal, etab_commune, etab_commune_deleguee, etab_courriel, etab_telephone, etab_site_internet, gest_batiment, gest_voie, gest_complement, gest_code_postal, gest_commune, gest_commune_deleguee, gest_courriel, gest_telephone, gest_site_internet FROM structures WHERE structure_id = ?', [id]);
    return rows[0];
  } finally {
    conn.release();
  }
};

export const create = async ({
  siret,
  siren,
  nom_commercial,
  sigle,
  denomination,
  numero_rna,
  registre_date,
  registre_volume,
  registre_folio,
  registre_tribunal_instance,
  etab_batiment,
  etab_voie,
  etab_complement,
  etab_code_postal,
  etab_commune,
  etab_commune_deleguee,
  etab_courriel,
  etab_telephone,
  etab_site_internet,
  gest_batiment,
  gest_voie,
  gest_complement,
  gest_code_postal,
  gest_commune,
  gest_commune_deleguee,
  gest_courriel,
  gest_telephone,
  gest_site_internet,
}, conn = null) => {
  const id = randomUUID();
  const c = conn || await pool.getConnection();
  try {
    await c.query(
      'INSERT INTO structures (structure_id, siret, siren, nom_commercial, sigle, denomination, numero_rna, registre_date, registre_volume, registre_folio, registre_tribunal_instance, etab_batiment, etab_voie, etab_complement, etab_code_postal, etab_commune, etab_commune_deleguee, etab_courriel, etab_telephone, etab_site_internet, gest_batiment, gest_voie, gest_complement, gest_code_postal, gest_commune, gest_commune_deleguee, gest_courriel, gest_telephone, gest_site_internet) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        siret ?? null,
        siren ?? null,
        nom_commercial ?? null,
        sigle ?? null,
        denomination ?? null,
        numero_rna ?? null,
        registre_date ?? null,
        registre_volume ?? null,
        registre_folio ?? null,
        registre_tribunal_instance ?? null,
        etab_batiment ?? null,
        etab_voie ?? null,
        etab_complement ?? null,
        etab_code_postal ?? null,
        etab_commune ?? null,
        etab_commune_deleguee ?? null,
        etab_courriel ?? null,
        etab_telephone ?? null,
        etab_site_internet ?? null,
        gest_batiment ?? null,
        gest_voie ?? null,
        gest_complement ?? null,
        gest_code_postal ?? null,
        gest_commune ?? null,
        gest_commune_deleguee ?? null,
        gest_courriel ?? null,
        gest_telephone ?? null,
        gest_site_internet ?? null,
      ]
    );
    return id;
  } finally {
    if (!conn) c.release();
  }
};

const UPDATABLE_COLUMNS = [
  'siret', 'siren', 'nom_commercial', 'sigle', 'denomination', 'numero_rna',
  'registre_date', 'registre_volume', 'registre_folio', 'registre_tribunal_instance',
  'etab_batiment', 'etab_voie', 'etab_complement', 'etab_code_postal', 'etab_commune',
  'etab_commune_deleguee', 'etab_courriel', 'etab_telephone', 'etab_site_internet',
  'gest_batiment', 'gest_voie', 'gest_complement', 'gest_code_postal', 'gest_commune',
  'gest_commune_deleguee', 'gest_courriel', 'gest_telephone', 'gest_site_internet',
];

export const update = async (id, data) => {
  const cols = UPDATABLE_COLUMNS.filter((k) => data[k] !== undefined);
  if (cols.length === 0) return 0;
  const sets = cols.map((k) => `${k} = ?`).join(', ');
  const values = cols.map((k) => data[k]);
  const conn = await pool.getConnection();
  try {
    const res = await conn.query(
      `UPDATE structures SET ${sets} WHERE structure_id = ?`,
      [...values, id]
    );
    return res.affectedRows;
  } finally {
    conn.release();
  }
};

export const remove = async (id) => {
  const conn = await pool.getConnection();
  try {
    const res = await conn.query('DELETE FROM structures WHERE structure_id = ?', [id]);
    return res.affectedRows;
  } finally {
    conn.release();
  }
};
