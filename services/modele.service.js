import { randomUUID } from 'crypto';
import * as modeleModel from '../models/modele.model.js';
import * as modeleArticleModel from '../models/modele_article.model.js';
import * as modeleVuModel from '../models/modele_vu.model.js';

const badRequest = (msg) => {
  const err = new Error(msg);
  err.status = 400;
  return err;
};

const notFound = (msg = 'Modèle introuvable') => {
  const err = new Error(msg);
  err.status = 404;
  return err;
};

const validateNom = (nom) => {
  if (nom == null) throw badRequest('Nom requis');
  const trimmed = String(nom).trim();
  if (trimmed === '') throw badRequest('Nom requis');
  if (trimmed.length > 128) throw badRequest('Nom trop long (128 caractères max)');
  return trimmed;
};

const validateTypeModele = (type) => {
  const n = Number(type);
  if (!Number.isInteger(n) || n < 0 || n > 2) {
    throw badRequest('Type de modèle invalide (0, 1 ou 2 attendu)');
  }
  return n;
};

export const listModeles = async () => {
  return await modeleModel.listAll();
};

export const getModeleById = async (id) => {
  const existing = await modeleModel.getById(id);
  if (!existing) throw notFound();
  const rows = await modeleArticleModel.listByModele(id);
  const vuRows = await modeleVuModel.listByModele(id);
  return {
    id: existing.id,
    nom: existing.nom,
    titre: existing.titre ?? '',
    type_modele: Number(existing.type_modele ?? 0),
    articles: rows.map((r) => ({
      id: r.id,
      titre: r.titre ?? '',
      contenu: r.contenu ?? '',
      ordre: Number(r.ordre ?? 0),
    })),
    vus: vuRows.map((r) => ({
      id: r.id,
      contenu: r.contenu ?? '',
      ordre: Number(r.ordre ?? 0),
    })),
  };
};

export const createModele = async ({ nom, type_modele }) => {
  const clean = validateNom(nom);
  const type = type_modele === undefined ? 0 : validateTypeModele(type_modele);
  const id = randomUUID();
  await modeleModel.create({ id, nom: clean, type_modele: type });
  return { id, nom: clean, type_modele: type };
};

export const updateModele = async (id, { nom, type_modele }) => {
  const clean = validateNom(nom);
  const existing = await modeleModel.getById(id);
  if (!existing) throw notFound();
  const data = { nom: clean };
  if (type_modele !== undefined) {
    data.type_modele = validateTypeModele(type_modele);
  }
  await modeleModel.update(id, data);
  return {
    id,
    nom: clean,
    type_modele: data.type_modele ?? Number(existing.type_modele ?? 0),
  };
};

export const deleteModele = async (id) => {
  const existing = await modeleModel.getById(id);
  if (!existing) throw notFound();
  const affectedRows = await modeleModel.remove(id);
  return { affectedRows };
};
