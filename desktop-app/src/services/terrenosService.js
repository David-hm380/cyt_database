import api from './api';

const terrenosService = {
  getAll: async () => {
    return api.getTerrenos();
  },

  create: async (terrenoData) => {
    return api.createTerreno(terrenoData);
  },

  update: async (id, terrenoData) => {
    return api.updateTerreno(id, terrenoData);
  },

  delete: async (id) => {
    return api.deleteTerreno(id);
  }
};

export default terrenosService;
