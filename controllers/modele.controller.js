import * as modeleService from '../services/modele.service.js';

export const list = async (req, res) => {
  console.log('[ctrl] modele.list entered');
  try {
    const modeles = await modeleService.listModeles();
    res.json(modeles);
  } catch (err) {
    console.error('[ctrl] modele.list err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  console.log('[ctrl] modele.create entered');
  try {
    const modele = await modeleService.createModele(req.body || {});
    res.status(201).json(modele);
  } catch (err) {
    console.error('[ctrl] modele.create err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 400).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  console.log('[ctrl] modele.update entered');
  try {
    const modele = await modeleService.updateModele(req.params.id, req.body || {});
    res.json(modele);
  } catch (err) {
    console.error('[ctrl] modele.update err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 400).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  console.log('[ctrl] modele.remove entered');
  try {
    const result = await modeleService.deleteModele(req.params.id);
    res.json(result);
  } catch (err) {
    console.error('[ctrl] modele.remove err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 400).json({ error: err.message });
  }
};
