import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(credentials);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#ffffff',
      position: 'relative'
    }}>
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
        padding: '48px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        width: '100%',
        maxWidth: '420px'
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '32px', 
          color: '#111827',
          fontSize: '24px',
          fontWeight: '700'
        }}>
          Construcción y Terrenos
        </h2>
        
        <p style={{
          textAlign: 'center',
          marginBottom: '32px',
          color: '#64748b',
          fontSize: '14px'
        }}>
          Ingresa tus credenciales para acceder
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label className="form-label">
              Usuario
            </label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className="form-control"
              placeholder="Tu nombre de usuario"
              required
              style={{
                fontSize: '16px',
                padding: '14px 16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label className="form-label">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="form-control"
              placeholder="Tu contraseña"
              required
              style={{
                fontSize: '16px',
                padding: '14px 16px'
              }}
            />
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '24px' }}>
              <span>!</span> {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ 
              width: '100%', 
              padding: '16px',
              fontSize: '16px',
              fontWeight: '600',
              height: '56px'
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner" style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  margin: 0
                }}></div>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
