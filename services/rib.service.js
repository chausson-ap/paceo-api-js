import { randomUUID } from 'crypto';
import * as ribModel from '../models/rib.model.js';
import * as userStructureModel from '../models/user_structure.model.js';
import * as pieceJointeService from './piece_jointe.service.js';

const IBAN_REGEX = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/i;
const BIC_REGEX = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i;

const badRequest = (msg) => {
  const err = new Error(msg);
  err.status = 400;
  return err;
};

const forbidden = (msg = 'Accès refusé') => {
  const err = new Error(msg);
  err.status = 403;
  return err;
};

const validateRib = (data) => {
  if (data.iban != null && String(data.iban) !== '') {
    const normalized = String(data.iban).replace(/\s+/g, '');
    if (!IBAN_REGEX.test(normalized)) throw badRequest('IBAN invalide');
  }
  if (data.code_bic != null && String(data.code_bic) !== '') {
    const normalized = String(data.code_bic).replace(/\s+/g, '');
    if (!BIC_REGEX.test(normalized)) throw badRequest('Code BIC invalide');
  }
};

const notFound = (msg = 'RIB introuvable') => {
  const err = new Error(msg);
  err.status = 404;
  return err;
};

const TEXT_FIELDS = [
  'etablissement',
  'domiciliation',
  'guichet',
  'titulaire',
  'numero_compte',
  'iban',
  'code_bic',
  'cle_rib',
];

const pickTextFields = (data) => {
  const out = {};
  for (const k of TEXT_FIELDS) {
    if (data[k] !== undefined) out[k] = data[k];
  }
  return out;
};

export const listRibs = async (structureId, userId) => {
  const role = await userStructureModel.findRole(userId, structureId);
  if (!role) throw forbidden();
  return await ribModel.listByStructure(structureId);
};

export const createRib = async (structureId, data, file, userId) => {
  const role = await userStructureModel.findRole(userId, structureId);
  if (!role) throw forbidden();
  validateRib(data);

  let piece_jointe_id = null;
  if (file) {
    const pj = await pieceJointeService.savePieceJointe(file);
    piece_jointe_id = pj.id;
  }

  const rib_id = randomUUID();
  const text = pickTextFields(data);
  await ribModel.create({
    rib_id,
    structure_id: structureId,
    ...text,
    piece_jointe_id,
  });

  return await ribModel.getById(rib_id);
};

export const updateRib = async (ribId, data, file, userId) => {
  const rib = await ribModel.getById(ribId);
  if (!rib) throw notFound();

  const role = await userStructureModel.findRole(userId, rib.structure_id);
  if (!role) throw forbidden();
  validateRib(data);

  const patch = pickTextFields(data);

  if (file) {
    const pj = await pieceJointeService.savePieceJointe(file);
    patch.piece_jointe_id = pj.id;
  }

  await ribModel.update(ribId, patch);
  return await ribModel.getById(ribId);
};

export const deleteRib = async (ribId, userId) => {
  const rib = await ribModel.getById(ribId);
  if (!rib) throw notFound();

  const role = await userStructureModel.findRole(userId, rib.structure_id);
  if (!role) throw forbidden();

  return await ribModel.remove(ribId);
};
