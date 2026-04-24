import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as agentModel from '../models/agent.model.js';

const TOKEN_TTL = '2h';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const badRequest = (msg) => {
  const err = new Error(msg);
  err.status = 400;
  return err;
};

const sanitize = (agent) => {
  if (!agent) return null;
  const { password_hash, ...safe } = agent;
  return safe;
};

const signToken = (id) => jwt.sign({ id, scope: 'bo' }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });

export const register = async ({ nom, email, password }) => {
  if (!nom || !email || !password) throw badRequest('Nom, email et mot de passe requis');
  const trimmedNom = String(nom).trim();
  if (trimmedNom === '') throw badRequest('Nom invalide');
  if (trimmedNom.length > 128) throw badRequest('Nom trop long (max 128 caractères)');
  if (/[<>]/.test(trimmedNom)) throw badRequest('Nom invalide');
  if (String(email).length > 254 || !EMAIL_REGEX.test(String(email))) throw badRequest('Email invalide');
  if (password.length < 8) throw badRequest('Mot de passe trop court (8 caractères minimum)');
  if (password.length > 128) throw badRequest('Mot de passe trop long (max 128 caractères)');

  const existing = await agentModel.findByEmail(email);
  if (existing) {
    const err = new Error('Email déjà utilisé');
    err.status = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 10);
  const id = randomUUID();
  await agentModel.create({ id, nom: trimmedNom, email, password_hash });
  const agent = await agentModel.findById(id);
  const token = signToken(id);
  return { token, agent: sanitize(agent) };
};

export const login = async ({ email, password }) => {
  if (!email || !password) throw new Error('Email et mot de passe requis');
  const agent = await agentModel.findByEmail(email);
  if (!agent || !agent.password_hash) {
    const err = new Error('Identifiants invalides');
    err.status = 401;
    throw err;
  }
  const ok = await bcrypt.compare(password, agent.password_hash);
  if (!ok) {
    const err = new Error('Identifiants invalides');
    err.status = 401;
    throw err;
  }
  const token = signToken(agent.id);
  return { token, agent: sanitize(agent) };
};

export const me = async (agentId) => {
  const agent = await agentModel.findById(agentId);
  if (!agent) {
    const err = new Error('Agent introuvable');
    err.status = 401;
    throw err;
  }
  return { agent: sanitize(agent) };
};
