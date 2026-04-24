import fs from 'fs';
import path from 'path';
import * as conventionModel from '../models/convention.model.js';
import * as conventionAnnexeModel from '../models/convention_annexe.model.js';
import * as contactModel from '../models/contact.model.js';
import * as pieceJointeModel from '../models/piece_jointe.model.js';
import * as pieceJointeService from './piece_jointe.service.js';

const UPLOADS_DIR = process.env.UPLOADS_DIR || './uploads';

const notFound = (msg = 'Convention introuvable') => {
  const err = new Error(msg);
  err.status = 404;
  return err;
};

const badRequest = (msg) => {
  const err = new Error(msg);
  err.status = 400;
  return err;
};

const unlinkSilently = async (nomStocke) => {
  if (!nomStocke) return;
  const abs = path.resolve(path.join(UPLOADS_DIR, nomStocke));
  try {
    await fs.promises.unlink(abs);
  } catch (err) {
    if (err && err.code !== 'ENOENT') {
      console.error('[svc] convention.unlinkSilently err:', err.message);
    }
  }
};

const buildAdresseComplete = (row) => {
  const parts = [
    row.etab_batiment,
    row.etab_voie,
    row.etab_code_postal,
    row.etab_commune,
  ]
    .map((p) => (p == null ? '' : String(p).trim()))
    .filter((p) => p !== '');
  return parts.join(' ');
};

export const listConventions = async () => {
  const rows = await conventionModel.listAll();
  return rows.map((r) => ({
    id: r.id,
    structure_id: r.structure_id,
    nom_unique: r.nom_unique,
    workflow_type: r.workflow_type,
    workflow: r.workflow,
    annee_conventionnement: r.annee_conventionnement ?? null,
    date_debut: r.date_debut ?? null,
    date_fin: r.date_fin ?? null,
    modele_id: r.modele_id ?? null,
    modele: r.modele_id
      ? { id: r.modele_id, nom: r.modele_nom ?? null }
      : null,
    structure: r.structure_id
      ? {
          denomination: r.denomination ?? null,
          nom_commercial: r.nom_commercial ?? null,
          sigle: r.sigle ?? null,
          siret: r.siret ?? null,
        }
      : null,
  }));
};

const buildDetailFromRow = async (row) => {
  const [contacts, annexes] = await Promise.all([
    row.structure_id ? contactModel.listByStructure(row.structure_id) : Promise.resolve([]),
    conventionAnnexeModel.listByConvention(row.id),
  ]);

  const structure = row.structure_id
    ? {
        id: row.structure_id,
        denomination: row.denomination ?? null,
        nom_commercial: row.nom_commercial ?? null,
        sigle: row.sigle ?? null,
        siret: row.siret ?? null,
        adresse_complete: buildAdresseComplete(row),
        contacts: contacts.map((c) => ({
          id: c.id,
          prenom: c.prenom ?? null,
          nom: c.nom ?? null,
          fonction: c.fonction ?? null,
          role: c.role ?? null,
          telephone: c.telephone ?? null,
          courriel: c.courriel ?? null,
        })),
      }
    : null;

  const modele = row.modele_fk_id
    ? { id: row.modele_fk_id, nom: row.modele_nom ?? null }
    : null;

  const logo = row.logo_pj_id
    ? {
        id: row.logo_pj_id,
        nom_original: row.logo_nom_original ?? null,
        type_mime: row.logo_type_mime ?? null,
        taille: row.logo_taille ?? null,
      }
    : null;

  return {
    id: row.id,
    structure_id: row.structure_id ?? null,
    nom_unique: row.nom_unique ?? null,
    workflow_type: row.workflow_type ?? null,
    workflow: row.workflow ?? null,
    modele_id: row.modele_id ?? null,
    type_action: row.type_action ?? null,
    dossier_id: row.dossier_id ?? null,
    code_activite: row.code_activite ?? null,
    annee_conventionnement: row.annee_conventionnement ?? null,
    date_debut: row.date_debut ?? null,
    duree_annees: row.duree_annees ?? null,
    date_fin: row.date_fin ?? null,
    signataire_structure_contact_id: row.signataire_structure_contact_id ?? null,
    signataire_structure_delegation: Number(row.signataire_structure_delegation ?? 0) ? 1 : 0,
    signataire_etat_agent_id: row.signataire_etat_agent_id ?? null,
    logo_piece_jointe_id: row.logo_piece_jointe_id ?? null,
    structure,
    modele,
    logo,
    annexes: annexes.map((a) => ({
      id: a.id,
      nom_original: a.nom_original ?? null,
      type_mime: a.type_mime ?? null,
      taille: a.taille ?? null,
      ordre: Number(a.ordre ?? 0),
    })),
  };
};

export const getConventionDetail = async (id) => {
  const row = await conventionModel.getById(id);
  if (!row) throw notFound();
  return await buildDetailFromRow(row);
};

export const getConventionByNom = async (nom) => {
  const row = await conventionModel.getByNomUnique(nom);
  if (!row) throw notFound();
  return await buildDetailFromRow(row);
};

const UPDATABLE_FIELDS = [
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
];

const pickUpdatable = (data) => {
  const out = {};
  for (const k of UPDATABLE_FIELDS) {
    if (data[k] !== undefined) out[k] = data[k];
  }
  return out;
};

const validateUpdate = (data) => {
  if (data.annee_conventionnement != null && data.annee_conventionnement !== '') {
    const n = Number(data.annee_conventionnement);
    if (!Number.isInteger(n) || n < 2000 || n > 2100) {
      throw badRequest('annee_conventionnement doit être entre 2000 et 2100');
    }
  }
  if (data.duree_annees != null && data.duree_annees !== '') {
    const n = Number(data.duree_annees);
    if (!Number.isInteger(n) || n < 1 || n > 99) {
      throw badRequest('duree_annees doit être entre 1 et 99');
    }
  }
  if (data.date_debut != null && data.date_debut !== '') {
    const d1 = new Date(data.date_debut);
    if (Number.isNaN(d1.getTime())) {
      throw badRequest('date_debut invalide');
    }
  }
  if (data.date_fin != null && data.date_fin !== '') {
    const d2 = new Date(data.date_fin);
    if (Number.isNaN(d2.getTime())) {
      throw badRequest('date_fin invalide');
    }
  }
  if (
    data.date_debut != null && data.date_debut !== '' &&
    data.date_fin != null && data.date_fin !== ''
  ) {
    const d1 = new Date(data.date_debut);
    const d2 = new Date(data.date_fin);
    if (!Number.isNaN(d1.getTime()) && !Number.isNaN(d2.getTime()) && d2 < d1) {
      throw badRequest('date_fin doit être supérieure ou égale à date_debut');
    }
  }
  if (data.signataire_structure_delegation !== undefined) {
    const v = Number(data.signataire_structure_delegation);
    if (v !== 0 && v !== 1) {
      throw badRequest('signataire_structure_delegation doit être 0 ou 1');
    }
  }
};

export const updateConvention = async (id, data) => {
  const existing = await conventionModel.getById(id);
  if (!existing) throw notFound();

  const patch = pickUpdatable(data || {});
  validateUpdate(patch);

  // Normaliser les empty-string en null pour les champs nullable
  const NULLABLE = [
    'annee_conventionnement',
    'date_debut',
    'duree_annees',
    'date_fin',
    'signataire_structure_contact_id',
    'signataire_etat_agent_id',
  ];
  for (const k of NULLABLE) {
    if (patch[k] === '') patch[k] = null;
  }
  if (patch.signataire_structure_delegation !== undefined) {
    patch.signataire_structure_delegation = Number(patch.signataire_structure_delegation) ? 1 : 0;
  }

  try {
    await conventionModel.update(id, patch);
  } catch (err) {
    if (err && (err.code === 'ER_DUP_ENTRY' || err.errno === 1062)) {
      const dup = new Error('Ce numéro de convention existe déjà.');
      dup.status = 409;
      throw dup;
    }
    throw err;
  }
  return await getConventionDetail(id);
};

export const replaceLogo = async (id, file) => {
  if (!file) throw badRequest('Fichier manquant');
  const existing = await conventionModel.getById(id);
  if (!existing) throw notFound();

  // Supprime l'ancien logo si présent
  if (existing.logo_piece_jointe_id) {
    const oldPj = await pieceJointeModel.getById(existing.logo_piece_jointe_id);
    await conventionModel.update(id, { logo_piece_jointe_id: null });
    if (oldPj) {
      await pieceJointeModel.remove(oldPj.id);
      await unlinkSilently(oldPj.nom_stocke);
    }
  }

  const pj = await pieceJointeService.savePieceJointe(file);
  await conventionModel.update(id, { logo_piece_jointe_id: pj.id });

  return {
    id: pj.id,
    nom_original: pj.nom_original,
    type_mime: pj.type_mime,
    taille: pj.taille,
  };
};

export const deleteLogo = async (id) => {
  const existing = await conventionModel.getById(id);
  if (!existing) throw notFound();
  if (!existing.logo_piece_jointe_id) return 0;

  const oldPj = await pieceJointeModel.getById(existing.logo_piece_jointe_id);
  await conventionModel.update(id, { logo_piece_jointe_id: null });
  let affected = 0;
  if (oldPj) {
    affected = await pieceJointeModel.remove(oldPj.id);
    await unlinkSilently(oldPj.nom_stocke);
  }
  return affected;
};

export const addAnnexe = async (id, file) => {
  if (!file) throw badRequest('Fichier manquant');
  const existing = await conventionModel.getById(id);
  if (!existing) throw notFound();

  const pj = await pieceJointeService.savePieceJointe(file);
  const maxOrdre = await conventionAnnexeModel.getMaxOrdre(id);
  const ordre = maxOrdre + 1;
  await conventionAnnexeModel.addAnnexe(id, pj.id, ordre);

  return {
    id: pj.id,
    nom_original: pj.nom_original,
    type_mime: pj.type_mime,
    taille: pj.taille,
    ordre,
  };
};

export const deleteAnnexe = async (pieceJointeId) => {
  const annexe = await conventionAnnexeModel.getByPieceJointeId(pieceJointeId);
  if (!annexe) throw notFound('Annexe introuvable');

  const nomStocke = annexe.nom_stocke;
  await conventionAnnexeModel.removeByPieceJointeId(pieceJointeId);
  const affected = await pieceJointeModel.remove(pieceJointeId);
  await unlinkSilently(nomStocke);
  return affected;
};
