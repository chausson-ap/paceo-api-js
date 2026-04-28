import { randomUUID } from 'crypto';
import pool from '../config/db.js';
import * as structureModel from '../models/structure.model.js';
import * as userStructureModel from '../models/user_structure.model.js';
import { normalizePhone } from './phone.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// NOTE: la colonne BDD numero_rna est actuellement VARCHAR(9). Le format
// officiel RNA est « W + 9 chiffres » = 10 caractères. Tant que la migration
// VARCHAR(10) n'est pas appliquée, on reste permissif sur 9 caractères.
const RNA_REGEX = /^.{9}$/;

const FREE_TEXT_FIELDS = [
  'denomination', 'nom_commercial', 'sigle',
  'registre_volume', 'registre_folio', 'registre_tribunal_instance',
  'etab_batiment', 'etab_voie', 'etab_complement', 'etab_commune',
  'etab_commune_deleguee', 'etab_site_internet',
  'gest_batiment', 'gest_voie', 'gest_complement', 'gest_commune',
  'gest_commune_deleguee', 'gest_site_internet',
];

const badRequest = (msg) => {
  const err = new Error(msg);
  err.status = 400;
  return err;
};

const hasControlOrHtml = (v) => {
  const s = String(v);
  if (s.includes('<') || s.includes('>')) return true;
  // caractères de contrôle (sauf tab/space); inclut \r, \n
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u0008\u000A-\u001F\u007F]/.test(s)) return true;
  return false;
};

const validateLengths = (data) => {
  const {
    siret, siren, numero_rna, etab_code_postal, gest_code_postal,
    etab_courriel, gest_courriel,
  } = data;

  if (siret != null && String(siret) !== '' && !/^\d{14}$/.test(String(siret))) {
    throw badRequest('SIRET doit faire 14 chiffres');
  }
  if (siren != null && String(siren) !== '' && !/^\d{9}$/.test(String(siren))) {
    throw badRequest('SIREN doit faire 9 chiffres');
  }
  if (numero_rna != null && String(numero_rna) !== '' && !RNA_REGEX.test(String(numero_rna))) {
    throw badRequest('Numéro RNA doit faire 9 caractères');
  }
  if (etab_code_postal != null && String(etab_code_postal) !== '' && !/^\d{5}$/.test(String(etab_code_postal))) {
    throw badRequest('Code postal doit faire 5 chiffres');
  }
  if (gest_code_postal != null && String(gest_code_postal) !== '' && !/^\d{5}$/.test(String(gest_code_postal))) {
    throw badRequest('Code postal doit faire 5 chiffres');
  }

  for (const courriel of [etab_courriel, gest_courriel]) {
    if (courriel != null && String(courriel) !== '') {
      const s = String(courriel);
      if (s.length > 128 || !s.includes('@') || !EMAIL_REGEX.test(s)) {
        throw badRequest('Courriel invalide');
      }
    }
  }

  for (const f of FREE_TEXT_FIELDS) {
    const v = data[f];
    if (v != null && String(v) !== '' && hasControlOrHtml(v)) {
      throw badRequest(`Champ ${f} contient des caractères non autorisés`);
    }
  }
};

const forbidden = (msg = 'Accès refusé') => {
  const err = new Error(msg);
  err.status = 403;
  return err;
};

const notFound = (msg = 'Structure introuvable') => {
  const err = new Error(msg);
  err.status = 404;
  return err;
};

export const listStructures = async (userId) => {
  const structures = await userStructureModel.listStructuresForUser(userId);
  return structures;
};

export const createStructure = async (data, userId) => {
  validateLengths(data);
  if (data.etab_telephone != null && String(data.etab_telephone) !== '') {
    data.etab_telephone = normalizePhone(data.etab_telephone);
  } else {
    data.etab_telephone = '';
  }
  if (data.gest_telephone != null && String(data.gest_telephone) !== '') {
    data.gest_telephone = normalizePhone(data.gest_telephone);
  } else {
    data.gest_telephone = '';
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const id = randomUUID();
    await conn.query(
      'INSERT INTO structures (structure_id, siret, siren, nom_commercial, sigle, denomination, numero_rna, registre_date, registre_volume, registre_folio, registre_tribunal_instance, etab_batiment, etab_voie, etab_complement, etab_code_postal, etab_commune, etab_commune_deleguee, etab_courriel, etab_telephone, etab_site_internet, gest_batiment, gest_voie, gest_complement, gest_code_postal, gest_commune, gest_commune_deleguee, gest_courriel, gest_telephone, gest_site_internet) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        data.siret ?? '',
        data.siren ?? '',
        data.nom_commercial ?? '',
        data.sigle ?? '',
        data.denomination ?? '',
        data.numero_rna ?? '',
        data.registre_date ?? null,
        data.registre_volume ?? '',
        data.registre_folio ?? '',
        data.registre_tribunal_instance ?? '',
        data.etab_batiment ?? '',
        data.etab_voie ?? '',
        data.etab_complement ?? '',
        data.etab_code_postal ?? '',
        data.etab_commune ?? '',
        data.etab_commune_deleguee ?? '',
        data.etab_courriel ?? '',
        data.etab_telephone ?? '',
        data.etab_site_internet ?? '',
        data.gest_batiment ?? '',
        data.gest_voie ?? '',
        data.gest_complement ?? '',
        data.gest_code_postal ?? '',
        data.gest_commune ?? '',
        data.gest_commune_deleguee ?? '',
        data.gest_courriel ?? '',
        data.gest_telephone ?? '',
        data.gest_site_internet ?? '',
      ]
    );
    await conn.query(
      'INSERT INTO user_structures (user_id, structure_id, role) VALUES (?, ?, ?)',
      [userId, id, 'owner']
    );
    await conn.commit();
    return id;
  } catch (err) {
    try { await conn.rollback(); } catch (_) { /* ignore */ }
    throw err;
  } finally {
    conn.release();
  }
};

export const getStructureById = async (id, userId) => {
  const structure = await structureModel.getById(id);
  if (!structure) throw notFound();
  const role = await userStructureModel.findRole(userId, id);
  if (!role) throw forbidden();
  return { ...structure, role };
};

export const updateStructure = async (id, data, userId) => {
  const existing = await structureModel.getById(id);
  if (!existing) throw notFound();
  const role = await userStructureModel.findRole(userId, id);
  if (!role) throw forbidden();
  validateLengths(data);
  if (data.etab_telephone !== undefined) {
    data.etab_telephone = (data.etab_telephone == null || String(data.etab_telephone) === '')
      ? '' : normalizePhone(data.etab_telephone);
  }
  if (data.gest_telephone !== undefined) {
    data.gest_telephone = (data.gest_telephone == null || String(data.gest_telephone) === '')
      ? '' : normalizePhone(data.gest_telephone);
  }
  return await structureModel.update(id, data);
};

export const deleteStructure = async (id, userId) => {
  const existing = await structureModel.getById(id);
  if (!existing) throw notFound();
  const role = await userStructureModel.findRole(userId, id);
  if (role !== 'owner') throw forbidden('Seul le propriétaire peut supprimer');
  return await structureModel.remove(id);
};
