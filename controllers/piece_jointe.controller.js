import * as pieceJointeService from '../services/piece_jointe.service.js';
import * as pieceJointeModel from '../models/piece_jointe.model.js';
import * as userStructureModel from '../models/user_structure.model.js';

export const download = async (req, res) => {
  console.log('[ctrl] piece_jointe.download entered:', req.params.id);
  try {
    const pj = await pieceJointeModel.getById(req.params.id);
    if (!pj) {
      return res.status(404).json({ error: 'Pièce jointe introuvable' });
    }

    const structureId = await pieceJointeModel.findStructureIdByPieceJointe(req.params.id);
    if (!structureId) {
      return res.status(404).json({ error: 'Pièce jointe introuvable' });
    }

    const role = await userStructureModel.findRole(req.user.id, structureId);
    if (!role) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    await pieceJointeService.streamPieceJointe(req.params.id, res);
  } catch (err) {
    console.error('[ctrl] piece_jointe.download err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    if (res.headersSent) return;
    res.status(err.status || 500).json({ error: err.message });
  }
};
