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

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
