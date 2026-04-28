import * as modeleVuService from '../services/modele_vu.service.js';

export const list = async (req, res) => {
  console.log('[ctrl] modele_vu.list entered');
  try {
    const vus = await modeleVuService.listVus(req.params.modeleId);
    res.json(vus);
  } catch (err) {
    console.error('[ctrl] modele_vu.list err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  console.log('[ctrl] modele_vu.create entered');
  try {
    const vu = await modeleVuService.createVu(req.params.modeleId, req.body || {});
    res.status(201).json(vu);
  } catch (err) {
    console.error('[ctrl] modele_vu.create err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 400).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  console.log('[ctrl] modele_vu.update entered');
  try {
    const vu = await modeleVuService.updateVu(req.params.vuId, req.body || {});
    res.json(vu);
  } catch (err) {
    console.error('[ctrl] modele_vu.update err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 400).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  console.log('[ctrl] modele_vu.remove entered');
  try {
    const result = await modeleVuService.deleteVu(req.params.vuId);
    res.json(result);
  } catch (err) {
    console.error('[ctrl] modele_vu.remove err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 400).json({ error: err.message });
  }
};

export const reorder = async (req, res) => {
  console.log('[ctrl] modele_vu.reorder entered');
  try {
    const orderedIds = req.body?.ordre;
    const result = await modeleVuService.reorderVus(req.params.modeleId, orderedIds);
    res.json(result);
  } catch (err) {
    console.error('[ctrl] modele_vu.reorder err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 400).json({ error: err.message });
  }
};
