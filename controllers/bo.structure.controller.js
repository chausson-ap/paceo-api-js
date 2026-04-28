import * as boStructureService from '../services/bo.structure.service.js';

export const list = async (req, res) => {
  console.log('[ctrl] bo.structure.list entered');
  try {
    const structures = await boStructureService.listAllStructures();
    res.json(structures);
  } catch (err) {
    console.error('[ctrl] bo.structure.list err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 500).json({ error: err.message });
  }
};
