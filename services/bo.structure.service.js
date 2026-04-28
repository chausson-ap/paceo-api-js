import * as boStructureModel from '../models/bo.structure.model.js';

export const listAllStructures = async () => {
  return await boStructureModel.listAllStructures();
};
