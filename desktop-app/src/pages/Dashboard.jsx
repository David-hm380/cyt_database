import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      id: 'usuarios',
      title: 'Usuarios',
      icon: '👥',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      route: '/usuarios'
    },
    {
      id: 'terrenos',
      title: 'Terrenos',
      icon: '🏗️',
      color: '#10b981',
      bgColor: '#d1fae5',
      route: '/terrenos'
    }
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navigation Header */}
      <nav className="nav-header">
        <div className="nav-brand">
          Construcción y Terrenos
        </div>
        
        <div className="nav-user">
          <div className="nav-user-info">
            <span className="nav-user-name">{user?.nombre}</span>
          </div>
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
        
        {/* Quick Actions */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Accesos Rápidos</h1>
            <p style={{ 
              color: 'var(--text-secondary)', 
              marginTop: '8px',
              fontSize: '16px'
            }}>
              Selecciona un módulo para comenzar a trabajar
            </p>
          </div>
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
                <span style={{ fontSize: '12px' }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
