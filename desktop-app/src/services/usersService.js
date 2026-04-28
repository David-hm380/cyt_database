import api from './api';

const usersService = {
  login: async (credentials) => {
    console.log('Intentando login con:', credentials);
    try {
      const result = await api.login(credentials);
      console.log('Respuesta del login:', result);
      return result;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  getAll: async () => {
    return api.getUsers();
  },

  create: async (userData) => {
    return api.createUser(userData);
  },

  update: async (id, userData) => {
    return api.updateUser(id, userData);
  },

  delete: async (id) => {
    return api.deleteUser(id);
  },

  getPermissions: async (userId) => {
    return api.getUserPermissions(userId);
  },

  getCurrentUser: async () => {
    return api.getCurrentUser();
  }
};

export default usersService;
