import * as structureService from '../services/structure.service.js';

export const getStructures = async (req, res) => {
  console.log('[ctrl] getStructures entered');
  try {
    const structures = await structureService.listStructures(req.user.id);
    res.json(structures);
  } catch (err) {
    console.error('[ctrl] getStructures err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const getStructureById = async (req, res) => {
  try {
    const structure = await structureService.getStructureById(req.params.id, req.user.id);
    res.json(structure);
  } catch (err) {
    console.error(err);
    if (err.cause) console.error('Cause:', err.cause);
    res.status(err.status || 404).json({ error: err.message });
  }
};

export const createStructure = async (req, res) => {
  try {
    const id = await structureService.createStructure(req.body, req.user.id);
    res.status(201).json({ id });
  } catch (err) {
    console.error(err);
    if (err.cause) console.error('Cause:', err.cause);
    res.status(err.status || 400).json({ error: err.message });
  }
};

export const updateStructure = async (req, res) => {
  try {
    const affected = await structureService.updateStructure(req.params.id, req.body, req.user.id);
    res.json({ affected });
  } catch (err) {
    console.error(err);
    if (err.cause) console.error('Cause:', err.cause);
    res.status(err.status || 400).json({ error: err.message });
  }
};

export const deleteStructure = async (req, res) => {
  try {
    const affected = await structureService.deleteStructure(req.params.id, req.user.id);
    res.json({ affected });
  } catch (err) {
    console.error(err);
    if (err.cause) console.error('Cause:', err.cause);
    res.status(err.status || 400).json({ error: err.message });
  }
};
