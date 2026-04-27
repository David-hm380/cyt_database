import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, moduleRequired }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const hasPermission = (module) => {
    if (!user || !user.permisos) return false;
    
    // Si permisos es un objeto, verificar si la propiedad existe y es true
    if (typeof user.permisos === 'object') {
      return user.permisos[module] === true;
    }
    
    // Si permisos es un array, verificar si incluye el permiso
    if (Array.isArray(user.permisos)) {
      return user.permisos.includes(module);
    }
    
    return false;
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (!hasPermission(moduleRequired)) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'var(--space-6)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '64px', marginBottom: 'var(--space-4)' }}>þ</div>
        <h1 style={{ 
          fontSize: 'var(--font-3xl)', 
          fontWeight: '700', 
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-3)'
        }}>
          Acceso Denegado
        </h1>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: 'var(--font-lg)',
          marginBottom: 'var(--space-6)',
          maxWidth: '500px'
        }}>
          No tienes permisos para acceder a este módulo. Contacta al administrador si necesitas acceso.
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary"
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
