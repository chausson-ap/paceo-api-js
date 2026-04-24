import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as authModel from '../models/auth.model.js';
import * as userStructureModel from '../models/user_structure.model.js';

const TOKEN_TTL = '2h';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const badRequest = (msg) => {
  const err = new Error(msg);
  err.status = 400;
  return err;
};

const sanitize = (user) => {
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
};

const signToken = (id) => jwt.sign({ id, scope: 'fo' }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });

export const register = async ({ name, email, password }) => {
  if (!name || !email || !password) throw badRequest('Nom, email et mot de passe requis');
  const trimmedName = String(name).trim();
  if (trimmedName === '') throw badRequest('Nom invalide');
  if (trimmedName.length > 128) throw badRequest('Nom trop long (max 128 caractères)');
  if (/[<>]/.test(trimmedName)) throw badRequest('Nom invalide');
  if (String(email).length > 254 || !EMAIL_REGEX.test(String(email))) throw badRequest('Email invalide');
  if (password.length < 8) throw badRequest('Mot de passe trop court (8 caractères minimum)');
  if (password.length > 128) throw badRequest('Mot de passe trop long (max 128 caractères)');

  const existing = await authModel.findUserByEmail(email);
  if (existing) {
    const err = new Error('Email déjà utilisé');
    err.status = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 10);
  const id = randomUUID();
  await authModel.createUser({ id, name: trimmedName, email, password_hash });
  const user = await authModel.findUserById(id);
  const token = signToken(id);
  return { token, user: sanitize(user), structures: [] };
};

export const login = async ({ email, password }) => {
  if (!email || !password) throw new Error('Email et mot de passe requis');
  const user = await authModel.findUserByEmail(email);
  if (!user || !user.password_hash) {
    const err = new Error('Identifiants invalides');
    err.status = 401;
    throw err;
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    const err = new Error('Identifiants invalides');
    err.status = 401;
    throw err;
  }
  const structures = await userStructureModel.listStructuresForUser(user.id);
  const token = signToken(user.id);
  return { token, user: sanitize(user), structures };
};

export const me = async (userId) => {
  const user = await authModel.findUserById(userId);
  if (!user) {
    const err = new Error('Utilisateur introuvable');
    err.status = 401;
    throw err;
  }
  const structures = await userStructureModel.listStructuresForUser(userId);
  return { user: sanitize(user), structures };
};
