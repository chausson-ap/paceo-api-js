import { randomUUID } from 'crypto';
import * as contactModel from '../models/contact.model.js';
import * as userStructureModel from '../models/user_structure.model.js';

const ALLOWED_ROLES = [0, 1, 2];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s+().-]{0,20}$/;

const forbidden = (msg = 'Accès refusé') => {
  const err = new Error(msg);
  err.status = 403;
  return err;
};

const notFound = (msg = 'Contact introuvable') => {
  const err = new Error(msg);
  err.status = 404;
  return err;
};

const badRequest = (msg) => {
  const err = new Error(msg);
  err.status = 400;
  return err;
};

const validateFields = (data, { partial = false } = {}) => {
  if (!partial || data.prenom !== undefined) {
    if (!data.prenom || String(data.prenom).trim() === '') throw badRequest('prenom requis');
    if (String(data.prenom).length > 64) throw badRequest('prenom trop long (max 64)');
  }
  if (!partial || data.nom !== undefined) {
    if (!data.nom || String(data.nom).trim() === '') throw badRequest('nom requis');
    if (String(data.nom).length > 64) throw badRequest('nom trop long (max 64)');
  }
  if (!partial || data.role !== undefined) {
    const r = Number(data.role);
    if (!ALLOWED_ROLES.includes(r)) throw badRequest(`role doit être parmi ${ALLOWED_ROLES.join(', ')}`);
  }
  if (data.correspondant_gestion !== undefined) {
    const cg = Number(data.correspondant_gestion);
    if (cg !== 0 && cg !== 1) throw badRequest('correspondant_gestion doit être 0 ou 1');
  }
  if (data.courriel !== undefined && data.courriel !== null && data.courriel !== '') {
    const s = String(data.courriel);
    if (s.length > 128 || !EMAIL_REGEX.test(s)) throw badRequest('courriel invalide');
  }
  if (data.telephone !== undefined && data.telephone !== null && data.telephone !== '') {
    if (!PHONE_REGEX.test(String(data.telephone))) throw badRequest('telephone invalide');
  }
  if (data.fonction !== undefined && data.fonction !== null && data.fonction !== '') {
    if (String(data.fonction).length > 128) throw badRequest('fonction trop long (max 128)');
  }
};

export const listContacts = async (structureId, userId) => {
  const role = await userStructureModel.findRole(userId, structureId);
  if (!role) throw forbidden();
  return await contactModel.listByStructure(structureId);
};

export const createContact = async (structureId, data, userId) => {
  const role = await userStructureModel.findRole(userId, structureId);
  if (!role) throw forbidden();
  validateFields(data);
  const id = randomUUID();
  await contactModel.create({
    id,
    structure_id: structureId,
    prenom: data.prenom,
    nom: data.nom,
    fonction: data.fonction ?? '',
    telephone: data.telephone ?? '',
    courriel: data.courriel ?? '',
    role: Number(data.role),
    correspondant_gestion: data.correspondant_gestion ? 1 : 0,
  });
  return await contactModel.getById(id);
};

export const updateContact = async (contactId, data, userId) => {
  const contact = await contactModel.getById(contactId);
  if (!contact) throw notFound();
  const role = await userStructureModel.findRole(userId, contact.structure_id);
  if (!role) throw forbidden();
  validateFields(data, { partial: true });
  const patch = { ...data };
  if (patch.role !== undefined) patch.role = Number(patch.role);
  if (patch.correspondant_gestion !== undefined) {
    patch.correspondant_gestion = patch.correspondant_gestion ? 1 : 0;
  }
  for (const k of ['fonction', 'telephone', 'courriel']) {
    if (patch[k] === null || patch[k] === undefined) delete patch[k];
  }
  await contactModel.update(contactId, patch);
  return await contactModel.getById(contactId);
};

export const deleteContact = async (contactId, userId) => {
  const contact = await contactModel.getById(contactId);
  if (!contact) throw notFound();
  const role = await userStructureModel.findRole(userId, contact.structure_id);
  if (!role) throw forbidden();
  return await contactModel.remove(contactId);
};
