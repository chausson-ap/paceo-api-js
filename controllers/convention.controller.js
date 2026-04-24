import * as conventionService from '../services/convention.service.js';

export const list = async (req, res) => {
  console.log('[ctrl] convention.list entered');
  try {
    const conventions = await conventionService.listConventions();
    res.json(conventions);
  } catch (err) {
    console.error('[ctrl] convention.list err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const detail = async (req, res) => {
  console.log('[ctrl] convention.detail entered:', req.params.id);
  try {
    const convention = await conventionService.getConventionDetail(req.params.id);
    res.json(convention);
  } catch (err) {
    console.error('[ctrl] convention.detail err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const detailByNom = async (req, res) => {
  console.log('[ctrl] convention.detailByNom entered:', req.params.nom);
  try {
    const convention = await conventionService.getConventionByNom(req.params.nom);
    res.json(convention);
  } catch (err) {
    console.error('[ctrl] convention.detailByNom err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  console.log('[ctrl] convention.update entered:', req.params.id);
  try {
    const convention = await conventionService.updateConvention(req.params.id, req.body || {});
    res.json(convention);
  } catch (err) {
    console.error('[ctrl] convention.update err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const uploadLogo = async (req, res) => {
  console.log('[ctrl] convention.uploadLogo entered:', req.params.id);
  try {
    const logo = await conventionService.replaceLogo(req.params.id, req.file);
    res.status(201).json({ logo });
  } catch (err) {
    console.error('[ctrl] convention.uploadLogo err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const removeLogo = async (req, res) => {
  console.log('[ctrl] convention.removeLogo entered:', req.params.id);
  try {
    const affectedRows = await conventionService.deleteLogo(req.params.id);
    res.json({ affectedRows });
  } catch (err) {
    console.error('[ctrl] convention.removeLogo err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const addAnnexe = async (req, res) => {
  console.log('[ctrl] convention.addAnnexe entered:', req.params.id);
  try {
    const annexe = await conventionService.addAnnexe(req.params.id, req.file);
    res.status(201).json({ annexe });
  } catch (err) {
    console.error('[ctrl] convention.addAnnexe err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const removeAnnexe = async (req, res) => {
  console.log('[ctrl] convention.removeAnnexe entered:', req.params.pieceJointeId);
  try {
    const affectedRows = await conventionService.deleteAnnexe(req.params.pieceJointeId);
    res.json({ affectedRows });
  } catch (err) {
    console.error('[ctrl] convention.removeAnnexe err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 500).json({ error: err.message });
  }
};
