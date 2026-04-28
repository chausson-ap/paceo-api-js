import { randomUUID } from 'crypto';
import * as modeleModel from '../models/modele.model.js';
import * as modeleVuModel from '../models/modele_vu.model.js';
import { sanitizeArticleHtml } from './html_sanitize.js';

const MAX_CONTENU_BYTES = 1024 * 1024; // 1 Mo

const badRequest = (msg) => {
  const err = new Error(msg);
  err.status = 400;
  return err;
};

const notFound = (msg = 'Vu introuvable') => {
  const err = new Error(msg);
  err.status = 404;
  return err;
};

const sanitizeAndCheckContenu = (contenu) => {
  const cleaned = sanitizeArticleHtml(contenu);
  const bytes = Buffer.byteLength(cleaned, 'utf8');
  if (bytes > MAX_CONTENU_BYTES) {
    throw badRequest('Contenu trop volumineux (> 1 Mo après sanitization)');
  }
  return cleaned;
};

const reshapeVu = (row) => ({
  id: row.id,
  contenu: row.contenu ?? '',
  ordre: Number(row.ordre ?? 0),
});

export const listVus = async (modeleId) => {
  const rows = await modeleVuModel.listByModele(modeleId);
  return rows.map(reshapeVu);
};

export const createVu = async (modeleId, data) => {
  const modele = await modeleModel.getById(modeleId);
  if (!modele) throw notFound('Modèle introuvable');

  if (data?.contenu == null) throw badRequest('Contenu requis');
  const contenu = sanitizeAndCheckContenu(data.contenu);

  const id = randomUUID();
  const maxOrdre = await modeleVuModel.getMaxOrdre(modeleId);
  const ordre = maxOrdre + 1;

  await modeleVuModel.create({ id, modeleId, contenu, ordre });
  return { id, contenu, ordre };
};

export const updateVu = async (vuId, data) => {
  const existing = await modeleVuModel.getById(vuId);
  if (!existing) throw notFound();

  const patch = {};
  if (data?.contenu !== undefined) {
    patch.contenu = sanitizeAndCheckContenu(data.contenu);
  }

  if (Object.keys(patch).length > 0) {
    await modeleVuModel.update(vuId, patch);
  }

  const reloaded = await modeleVuModel.getById(vuId);
  return reshapeVu(reloaded);
};

export const deleteVu = async (vuId) => {
  const existing = await modeleVuModel.getById(vuId);
  if (!existing) throw notFound();
  const affectedRows = await modeleVuModel.remove(vuId);
  return { affectedRows };
};

export const reorderVus = async (modeleId, orderedIds) => {
  const modele = await modeleModel.getById(modeleId);
  if (!modele) throw notFound('Modèle introuvable');

  if (!Array.isArray(orderedIds)) {
    throw badRequest('ordre doit être un tableau');
  }
  for (const id of orderedIds) {
    if (typeof id !== 'string' || id === '') {
      throw badRequest('ordre doit contenir des identifiants non vides');
    }
  }
  // Détecte les doublons
  const set = new Set(orderedIds);
  if (set.size !== orderedIds.length) {
    throw badRequest('ordre contient des doublons');
  }

  const affectedRows = await modeleVuModel.bulkUpdateOrdre(modeleId, orderedIds);
  return { affectedRows };
};
