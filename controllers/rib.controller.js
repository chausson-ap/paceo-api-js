import * as ribService from '../services/rib.service.js';

export const list = async (req, res) => {
  console.log('[ctrl] rib.list entered:', req.params.structureId);
  try {
    const ribs = await ribService.listRibs(req.params.structureId, req.user.id);
    res.json(ribs);
  } catch (err) {
    console.error('[ctrl] rib.list err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  console.log('[ctrl] rib.create entered:', req.params.structureId);
  try {
    const rib = await ribService.createRib(
      req.params.structureId,
      req.body,
      req.file,
      req.user.id
    );
    res.status(201).json(rib);
  } catch (err) {
    console.error('[ctrl] rib.create err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  console.log('[ctrl] rib.update entered:', req.params.ribId);
  try {
    const rib = await ribService.updateRib(
      req.params.ribId,
      req.body,
      req.file,
      req.user.id
    );
    res.json(rib);
  } catch (err) {
    console.error('[ctrl] rib.update err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  console.log('[ctrl] rib.remove entered:', req.params.ribId);
  try {
    const affected = await ribService.deleteRib(req.params.ribId, req.user.id);
    res.json({ affected });
  } catch (err) {
    console.error('[ctrl] rib.remove err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 500).json({ error: err.message });
  }
};
