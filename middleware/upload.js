import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const UPLOADS_DIR = process.env.UPLOADS_DIR || './uploads';

// Whitelists MIME
const DEFAULT_ALLOWED_MIMES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
]);

const LOGO_ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
]);

// Whitelists d'extensions (source de vérité pour la sanitization du nom)
const DEFAULT_ALLOWED_EXTS = new Set(['.pdf', '.jpg', '.jpeg', '.png']);
const LOGO_ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png']);

// Nom original : lettres FR, chiffres, _-. espace, apostrophe, longueur 1..200
const ORIGINALNAME_REGEX = /^[\w\-. À-ÿ']{1,200}$/;

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      cb(null, UPLOADS_DIR);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const rejectBadName = (file, cb) => {
  if (!file.originalname || !ORIGINALNAME_REGEX.test(file.originalname)) {
    const err = new Error(`Nom de fichier invalide: ${file.originalname}`);
    err.status = 400;
    cb(err);
    return true;
  }
  return false;
};

const rejectBadExt = (file, allowedExts, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExts.has(ext)) {
    const err = new Error(`Extension non autorisée: ${ext || '(aucune)'}`);
    err.status = 400;
    cb(err);
    return true;
  }
  // Vérifie la double extension : la dernière partie après un "." doit
  // être l'extension autorisée, et aucune partie intermédiaire ne doit
  // ressembler à un exécutable connu.
  const parts = file.originalname.split('.');
  if (parts.length >= 3) {
    const dangerousMiddleExts = new Set([
      'exe', 'bat', 'cmd', 'sh', 'js', 'php', 'py', 'pl', 'rb', 'ps1', 'vbs', 'jar',
    ]);
    for (let i = 1; i < parts.length - 1; i += 1) {
      if (dangerousMiddleExts.has(parts[i].toLowerCase())) {
        const err = new Error('Nom de fichier suspect (double extension)');
        err.status = 400;
        cb(err);
        return true;
      }
    }
  }
  return false;
};

const makeFileFilter = (allowedMimes, allowedExts) => (req, file, cb) => {
  if (rejectBadName(file, cb)) return;
  if (rejectBadExt(file, allowedExts, cb)) return;
  if (!allowedMimes.has(file.mimetype)) {
    const err = new Error(`Type de fichier non autorisé: ${file.mimetype}`);
    err.status = 400;
    return cb(err);
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter: makeFileFilter(DEFAULT_ALLOWED_MIMES, DEFAULT_ALLOWED_EXTS),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadLogo = multer({
  storage,
  fileFilter: makeFileFilter(LOGO_ALLOWED_MIMES, LOGO_ALLOWED_EXTS),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Exportées pour permettre la vérification magic-bytes côté service
export const ALLOWED_MIMES = {
  document: Array.from(DEFAULT_ALLOWED_MIMES),
  logo: Array.from(LOGO_ALLOWED_MIMES),
};

const makeUploadSingle = (multerInstance, kind) => (fieldName) => (req, res, next) => {
  const handler = multerInstance.single(fieldName);
  handler(req, res, (err) => {
    if (err) {
      console.error('[upload] err:', err.message);
      const status = err.status || 400;
      return res.status(status).json({ error: err.message });
    }
    if (req.file) {
      req.file.uploadKind = kind;
    }
    next();
  });
};

export const uploadSingle = makeUploadSingle(upload, 'document');
export const uploadLogoSingle = makeUploadSingle(uploadLogo, 'logo');
