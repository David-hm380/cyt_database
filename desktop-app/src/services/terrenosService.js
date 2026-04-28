import api from './api';

const terrenosService = {
  getAll: async () => {
    return api.getTerrenos();
  },

  getPaginated: async (page = 1, limit = 20) => {
    return api.getTerrenosPaginated(page, limit);
  },

  getById: async (id) => {
    return api.getTerrenoById(id);
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
