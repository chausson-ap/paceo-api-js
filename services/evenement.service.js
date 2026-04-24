import * as evenementModel from '../models/evenement.model.js';

export const listEvenements = async () => {
  return await evenementModel.listAll();
};
