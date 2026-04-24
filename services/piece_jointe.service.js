import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileTypeFromFile } from 'file-type';
import * as pieceJointeModel from '../models/piece_jointe.model.js';
import { ALLOWED_MIMES } from '../middleware/upload.js';

const UPLOADS_DIR = process.env.UPLOADS_DIR || './uploads';

const notFound = (msg = 'Pièce jointe introuvable') => {
  const err = new Error(msg);
  err.status = 404;
  return err;
};

const badRequest = (msg) => {
  const err = new Error(msg);
  err.status = 400;
  return err;
};

const unlinkSafe = (absPath) => {
  try { fs.unlinkSync(absPath); } catch (_) { /* ignore */ }
};

const verifyMagicBytes = async (file) => {
  const kind = file.uploadKind === 'logo' ? 'logo' : 'document';
  const allowed = ALLOWED_MIMES[kind] ?? ALLOWED_MIMES.document;
  const label = kind === 'logo' ? 'logo' : 'document';

  const absPath = file.path
    ? path.resolve(file.path)
    : path.resolve(path.join(UPLOADS_DIR, file.filename));

  const detected = await fileTypeFromFile(absPath);
  if (!detected) {
    unlinkSafe(absPath);
    throw badRequest(`Le fichier n'est pas un ${label} valide.`);
  }
  if (!allowed.includes(detected.mime)) {
    unlinkSafe(absPath);
    throw badRequest(`Le fichier n'est pas un ${label} valide.`);
  }
  // Cohérence: le MIME annoncé par multer doit aussi être dans la whitelist
  if (!allowed.includes(file.mimetype)) {
    unlinkSafe(absPath);
    throw badRequest(`Type de fichier non autorisé: ${file.mimetype}`);
  }
};

export const savePieceJointe = async (file) => {
  console.log('[svc] piece_jointe.savePieceJointe:', file?.originalname);
  if (!file) throw badRequest('Fichier manquant');

  await verifyMagicBytes(file);

  const id = randomUUID();
  await pieceJointeModel.create({
    piece_jointe_id: id,
    nom_stocke: file.filename,
    nom_original: file.originalname,
    type_mime: file.mimetype,
    taille: file.size,
  });
  return {
    id,
    nom_original: file.originalname,
    type_mime: file.mimetype,
    taille: file.size,
  };
};

export const streamPieceJointe = async (id, res) => {
  console.log('[svc] piece_jointe.streamPieceJointe:', id);
  const pj = await pieceJointeModel.getById(id);
  if (!pj) throw notFound();
  const absolutePath = path.resolve(path.join(UPLOADS_DIR, pj.nom_stocke));
  res.setHeader('Content-Type', pj.type_mime);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${pj.nom_original.replace(/"/g, '\\"')}"`
  );
  return new Promise((resolve, reject) => {
    res.sendFile(absolutePath, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};
