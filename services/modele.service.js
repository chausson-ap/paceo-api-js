import { randomUUID } from 'crypto';
import * as modeleModel from '../models/modele.model.js';

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

export const listModeles = async () => {
  return await modeleModel.listAll();
};

export const createModele = async ({ nom }) => {
  const clean = validateNom(nom);
  const id = randomUUID();
  await modeleModel.create({ id, nom: clean });
  return { id, nom: clean };
};

export const updateModele = async (id, { nom }) => {
  const clean = validateNom(nom);
  const existing = await modeleModel.getById(id);
  if (!existing) throw notFound();
  await modeleModel.update(id, { nom: clean });
  return { id, nom: clean };
};

export const deleteModele = async (id) => {
  const existing = await modeleModel.getById(id);
  if (!existing) throw notFound();
  const affectedRows = await modeleModel.remove(id);
  return { affectedRows };
};
