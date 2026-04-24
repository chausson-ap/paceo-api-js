import * as evenementService from '../services/evenement.service.js';

export const list = async (req, res) => {
  console.log('[ctrl] evenement.list entered');
  try {
    const evenements = await evenementService.listEvenements();
    res.json(evenements);
  } catch (err) {
    console.error('[ctrl] evenement.list err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 500).json({ error: err.message });
  }
};
