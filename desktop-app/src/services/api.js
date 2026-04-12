const API_BASE_URL = 'https://cyt-database-1.onrender.com';

const api = {
  // Login y autenticación
  login: async (credentials) => {
    console.log('Haciendo petición a:', `${API_BASE_URL}/users/login`);
    console.log('Credenciales:', credentials);
    
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    console.log('Status de respuesta:', response.status);
    console.log('Headers de respuesta:', response.headers);
    
    const result = await response.json();
    console.log('JSON de respuesta:', result);
    
    return result;
  },

  // Usuarios
  getUsers: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  createUser: async (userData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  updateUser: async (id, userData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  deleteUser: async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  getUserPermissions: async (userId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/${userId}/permisos`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  // Terrenos
  getTerrenos: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/terrenos`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  createTerreno: async (terrenoData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/terrenos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(terrenoData),
    });
    return response.json();
  },

  updateTerreno: async (id, terrenoData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/terrenos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(terrenoData),
    });
    return response.json();
  },

  deleteTerreno: async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/terrenos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
};

export default api;
