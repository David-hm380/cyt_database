import React, { createContext, useContext, useState, useEffect } from 'react';
import usersService from '../services/usersService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await usersService.login(credentials);
      
      if (response.token) {
        // Combinar usuario con permisos
        const userWithPermissions = {
          ...response.usuario,
          permisos: response.permisos
        };
        
        console.log('Login exitoso - Usuario con permisos:', userWithPermissions);
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(userWithPermissions));
        setUser(userWithPermissions);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        logout();
        return false;
      }

      // Obtener datos actualizados del usuario
      const response = await usersService.getCurrentUser();
      if (response.usuario) {
        // Combinar usuario con permisos actualizados
        const userWithPermissions = {
          ...response.usuario,
          permisos: response.permisos
        };
        
        console.log('Usuario actualizado con permisos:', userWithPermissions);
        
        localStorage.setItem('user', JSON.stringify(userWithPermissions));
        setUser(userWithPermissions);
        return true;
      }
    } catch (error) {
      console.error('Error al refrescar usuario:', error);
      // Si hay error, podría ser que el token expiró
      logout();
      return false;
    }
  };

  const checkPermission = (permission) => {
    if (!user || !user.permisos) return false;
    
    // Si permisos es un objeto, verificar si la propiedad existe y es true
    if (typeof user.permisos === 'object') {
      return user.permisos[permission] === true;
    }
    
    // Si permisos es un array, verificar si incluye el permiso
    if (Array.isArray(user.permisos)) {
      return user.permisos.includes(permission);
    }
    
    // Si permisos es un string separado por comas
    if (typeof user.permisos === 'string') {
      const permissionsArray = user.permisos.split(',').map(p => p.trim());
      return permissionsArray.includes(permission);
    }
    
    return false;
  };

  const value = {
    user,
    login,
    logout,
    loading,
    refreshUser,
    checkPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
