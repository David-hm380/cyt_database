import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const { user, logout, refreshUser, checkPermission } = useAuth();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRefreshPermissions = async () => {
    setRefreshing(true);
    const success = await refreshUser();
    if (success) {
      // Opcional: mostrar mensaje de éxito
      console.log('Permisos actualizados correctamente');
    }
    setRefreshing(false);
  };

  // Definir items de módulos (sin filtros)
  const allMenuItems = [
    {
      id: 'terrenos',
      title: 'Terrenos',
      icon: 'T',
      color: '#10b981',
      bgColor: '#d1fae5',
      route: '/terrenos'
    }
  ];

  // Filtrar módulos por permisos
  const menuItems = allMenuItems.filter(item => 
    checkPermission(item.permissionRequired || item.id)
  );

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navigation Header */}
      <nav className="nav-header">
        <div className="nav-brand">
          Construcción y Terrenos
        </div>
        
        <div className="nav-user">
          {checkPermission('usuarios') && (
            <button 
              onClick={() => navigate('/usuarios')}
              className="btn btn-secondary btn-sm"
              style={{ marginRight: '10px' }}
              title="Gestión de Usuarios"
            >
                <span style={{ marginRight: '5px' }}>U</span>
                Usuarios
              </button>
            )}
          <div className="nav-user-info">
            <span className="nav-user-name">{user?.nombre}</span>
          </div>
          <button 
            onClick={handleRefreshPermissions}
            className="btn btn-secondary btn-sm"
            style={{ marginRight: '10px' }}
            title="Refrescar permisos"
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <span style={{ marginRight: '5px' }}>⟳</span>
                Actualizando...
              </>
            ) : (
              <>
                <span style={{ marginRight: '5px' }}>⟳</span>
                Refrescar
              </>
            )}
          </button>
          <button 
            onClick={handleLogout}
            className="btn btn-danger btn-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container">
        
        {/* Barra de Filtros - Funcionalidad Aparte */}
        {user && (
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-8)',
            border: '2px solid var(--border-color)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-4)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: '#dbeafe',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#3b82f6',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
                }}>
                  F
                </div>
                <div>
                  <h2 style={{
                    margin: 0,
                    fontSize: 'var(--font-2xl)',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.025em'
                  }}>
                    Filtros
                  </h2>
                  <p style={{
                    margin: '4px 0 0',
                    fontSize: 'var(--font-sm)',
                    color: 'var(--text-secondary)',
                    fontWeight: '500'
                  }}>
                    Búsqueda avanzada de propiedades
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/filtros')}
                className="btn btn-primary"
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  fontSize: 'var(--font-sm)',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)'
                }}
              >
                Abrir Filtros
                <span style={{ fontSize: '16px' }}>→</span>
              </button>
            </div>
          </div>
        )}

        {/* Módulos */}
        <div className="page-header">
          <h1 className="page-title">Módulos</h1>
        </div>

        {/* Menu Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: 'var(--space-6)',
          marginTop: 'var(--space-8)'
        }}>
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="card"
              onClick={() => navigate(item.route)}
              style={{
                cursor: 'pointer',
                textAlign: 'center',
                position: 'relative',
                padding: 'var(--space-8)',
                background: 'var(--bg-primary)',
                border: `2px solid ${item.bgColor}`,
                transition: 'all var(--transition)'
              }}
            >
              {/* Icon */}
              <div style={{
                width: '64px',
                height: '64px',
                background: item.bgColor,
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-5)',
                fontSize: '28px',
                boxShadow: `0 4px 12px ${item.color}20`,
              }}>
                {item.icon}
              </div>
              
              {/* Content */}
              <h3 style={{
                fontSize: 'var(--font-xl)',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-4)',
                letterSpacing: '-0.01em'
              }}>
                {item.title}
              </h3>
              
              {/* Action indicator */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                color: item.color,
                fontWeight: '500',
                fontSize: 'var(--font-sm)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius)',
                background: `${item.bgColor}40`,
                transition: 'all var(--transition)'
              }}>
                Abrir módulo
                <span style={{ fontSize: '12px' }}>&gt;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
