import { randomUUID } from 'crypto';
import * as modeleModel from '../models/modele.model.js';
import * as modeleArticleModel from '../models/modele_article.model.js';
import { sanitizeArticleHtml } from './html_sanitize.js';

const MAX_CONTENU_BYTES = 1024 * 1024; // 1 Mo

const badRequest = (msg) => {
  const err = new Error(msg);
  err.status = 400;
  return err;
};

const notFound = (msg = 'Article introuvable') => {
  const err = new Error(msg);
  err.status = 404;
  return err;
};

const validateTitre = (titre) => {
  if (titre == null) return '';
  const value = String(titre);
  if (value.length > 255) throw badRequest('Titre trop long (255 caractères max)');
  return value;
};

const sanitizeAndCheckContenu = (contenu) => {
  const cleaned = sanitizeArticleHtml(contenu);
  const bytes = Buffer.byteLength(cleaned, 'utf8');
  if (bytes > MAX_CONTENU_BYTES) {
    throw badRequest('Contenu trop volumineux (> 1 Mo après sanitization)');
  }
  return cleaned;
};

const reshapeArticle = (row) => ({
  id: row.id,
  titre: row.titre ?? '',
  contenu: row.contenu ?? '',
  ordre: Number(row.ordre ?? 0),
});

export const listArticles = async (modeleId) => {
  const rows = await modeleArticleModel.listByModele(modeleId);
  return rows.map(reshapeArticle);
};

export const createArticle = async (modeleId, data) => {
  const modele = await modeleModel.getById(modeleId);
  if (!modele) throw notFound('Modèle introuvable');

  const titre = validateTitre(data?.titre);
  if (data?.contenu == null) throw badRequest('Contenu requis');
  const contenu = sanitizeAndCheckContenu(data.contenu);

  const id = randomUUID();
  const maxOrdre = await modeleArticleModel.getMaxOrdre(modeleId);
  const ordre = maxOrdre + 1;

  await modeleArticleModel.create({ id, modeleId, titre, contenu, ordre });
  return { id, titre, contenu, ordre };
};

export const updateArticle = async (articleId, data) => {
  const existing = await modeleArticleModel.getById(articleId);
  if (!existing) throw notFound();

  const patch = {};
  if (data?.titre !== undefined) {
    patch.titre = validateTitre(data.titre);
  }
  if (data?.contenu !== undefined) {
    patch.contenu = sanitizeAndCheckContenu(data.contenu);
  }

  if (Object.keys(patch).length > 0) {
    await modeleArticleModel.update(articleId, patch);
  }

  const reloaded = await modeleArticleModel.getById(articleId);
  return reshapeArticle(reloaded);
};

export const deleteArticle = async (articleId) => {
  const existing = await modeleArticleModel.getById(articleId);
  if (!existing) throw notFound();
  const affectedRows = await modeleArticleModel.remove(articleId);
  return { affectedRows };
};

export const reorderArticles = async (modeleId, orderedIds) => {
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

  const affectedRows = await modeleArticleModel.bulkUpdateOrdre(modeleId, orderedIds);
  return { affectedRows };
};
