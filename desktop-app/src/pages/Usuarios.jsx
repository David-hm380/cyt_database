import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usersService from '../services/usersService';
import { useAuth } from '../contexts/AuthContext';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    username: '',
    password: '',
    permisos: {
      terrenos: false,
      usuarios: false
    }
  });
  const [userPermissions, setUserPermissions] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0); // Para forzar re-render
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadUsuarios();
  }, []);

  // Limpiar estados cuando se cierra el formulario
  useEffect(() => {
    if (!showForm) {
      // Forzar limpieza de estados cuando el modal se cierra
      const timer = setTimeout(() => {
        setEditingUser(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showForm]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedUser) return;

      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          navigateUser(currentIndex - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateUser(currentIndex + 1);
          break;
        case 'Escape':
          e.preventDefault();
          setSelectedUser(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedUser, currentIndex, usuarios.length]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const data = await usersService.getAll();
      
      // Debug: Ver qué datos vienen del backend
      console.log('Usuarios recibidos del backend:', data);
      console.log('Primer usuario con fechas:', data[0]);
      
      // Cargar permisos para cada usuario
      const usuariosConPermisos = await Promise.all(
        data.map(async (usuario) => {
          try {
            const permisos = await usersService.getPermissions(usuario.id);
            return { ...usuario, permisos };
          } catch (err) {
            console.error(`Error cargando permisos para usuario ${usuario.id}:`, err);
            return { ...usuario, permisos: {} };
          }
        })
      );
      
      setUsuarios(usuariosConPermisos);
      setError(null);
    } catch (err) {
      setError('Error al cargar los usuarios: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (usuario, index) => {
    setSelectedUser(usuario);
    setCurrentIndex(index);
  };

  const navigateUser = (newIndex) => {
    if (newIndex >= 0 && newIndex < usuarios.length) {
      setSelectedUser(usuarios[newIndex]);
      setCurrentIndex(newIndex);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await usersService.update(editingUser.id, formData);
      } else {
        await usersService.create(formData);
      }
      
      resetForm();
      setShowForm(false);
      loadUsuarios();
    } catch (err) {
      setError('Error al guardar el usuario: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = async (usuario) => {
    setEditingUser(usuario);
    setSelectedUser(null); // Cerrar vista de detalles
    
    // Cargar permisos del usuario directamente y usarlos
    try {
      const permissions = await usersService.getPermissions(usuario.id);
      console.log('Permisos recibidos del backend para edición:', permissions);
      
      // Setear formulario con datos del usuario y sus permisos
      setFormData({
        nombre: usuario.nombre,
        username: usuario.username,
        password: '',
        permisos: permissions || {
          terrenos: false,
          usuarios: false
        }
      });
      
      // También actualizar el estado por si se necesita después
      setUserPermissions(permissions);
    } catch (err) {
      console.error('Error cargando permisos para edición:', err);
      // Usar permisos del usuario como fallback
      setFormData({
        nombre: usuario.nombre,
        username: usuario.username,
        password: '',
        permisos: usuario.permisos || {
          terrenos: false,
          usuarios: false
        }
      });
    }
    
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await usersService.delete(deleteTargetId);
      
      // Si el usuario eliminado era el seleccionado, limpiar selección
      if (selectedUser && selectedUser.id === deleteTargetId) {
        setSelectedUser(null);
      }
      
      // Limpiar completamente el estado del formulario
      resetForm();
      setShowForm(false);
      setEditingUser(null);
      setForceUpdate(prev => prev + 1);
      
      // Recargar la lista
      loadUsuarios();
      
      // Cerrar modal
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
    } catch (err) {
      setError('Error al eliminar el usuario: ' + (err.response?.data?.message || err.message));
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteTargetId(null);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      username: '',
      password: '',
      permisos: {
        terrenos: false,
        usuarios: false
      }
    });
    setEditingUser(null);
  };

  const handleChange = (e) => {
    try {
      const target = e.target;
      const { name, value, type, checked } = target;
      
      console.log('handleChange:', { 
        name, 
        value, 
        type, 
        checked, 
        disabled: target.disabled,
        readOnly: target.readOnly 
      });
      
      // Prevenir si el input está deshabilitado
      if (target.disabled || target.readOnly) {
        console.log('Input is disabled or readOnly, skipping update');
        return;
      }
      
      if (name.startsWith('permisos.')) {
        const permisoKey = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          permisos: {
            ...prev.permisos,
            [permisoKey]: checked
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value
        }));
      }
    } catch (error) {
      console.error('Error in handleChange:', error);
    }
  };

  if (loading) {
    return <div className="loading">Cargando usuarios...</div>;
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navigation Header */}
      <nav className="nav-header">
        <div className="nav-brand">
          Construcción y Terrenos
        </div>
        
        <div className="nav-user">
          <button 
            className="btn btn-outline"
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>«</span>
            Regresar
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Gestión de Usuarios</h1>
            <p style={{ 
              color: 'var(--text-secondary)', 
              marginTop: '8px',
              fontSize: '16px'
            }}>
              Administra usuarios y sus permisos
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <span>+</span>
            Nuevo Usuario
          </button>
        </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '500px' }}>
            <div className="modal-header">
              <h3>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            <form key={`${editingUser ? `edit-${editingUser.id}` : 'new'}-${forceUpdate}`} onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ marginBottom: '15px' }}>
                  <label>Nombre:</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    onFocus={(e) => console.log('Input focused:', e.target.name)}
                    className="form-control"
                    required
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label>Usuario:</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="form-control"
                    required
                    disabled={!!editingUser}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label>Contraseña:</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-control"
                    placeholder={editingUser ? 'Dejar en blanco para no cambiar' : ''}
                    required={!editingUser}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label>Permisos:</label>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label>
                      <input
                        type="checkbox"
                        name="permisos.terrenos"
                        checked={formData.permisos.terrenos}
                        onChange={handleChange}
                      />
                      Terrenos
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="permisos.usuarios"
                        checked={formData.permisos.usuarios}
                        onChange={handleChange}
                      />
                      Usuarios
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Estado</th>
              <th>Permisos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario, index) => (
              <tr 
                key={usuario.id}
                onClick={() => handleViewDetails(usuario, index)}
                style={{ cursor: 'pointer' }}
              >
                <td>{usuario.id}</td>
                <td>{usuario.nombre}</td>
                <td>{usuario.username}</td>
                <td>
                  <span className={`badge ${usuario.activo ? 'badge-success' : 'badge-danger'}`}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  {Object.entries(usuario.permisos || {}).map(([key, value]) => (
                    <span key={key} className={`badge ${value ? 'badge-success' : 'badge-secondary'}`} style={{ marginRight: '5px' }}>
                      {key}
                    </span>
                  ))}
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(usuario);
                    }}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(usuario.id);
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '800px', maxHeight: '90vh' }}>
            <div className="modal-header">
              <h3>Detalles del Usuario</h3>
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedUser(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {/* Información básica */}
              <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Información Personal</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div><strong>ID:</strong> {selectedUser.id}</div>
                  <div><strong>Nombre:</strong> {selectedUser.nombre}</div>
                  <div><strong>Usuario:</strong> {selectedUser.username}</div>
                  <div><strong>Estado:</strong> {selectedUser.activo ? 'Activo' : 'Inactivo'}</div>
                </div>
              </div>

              {/* Permisos */}
              <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Permisos del Sistema</h4>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {[
                    { id: 'terrenos', name: 'Gestión de Terrenos' },
                    { id: 'usuarios', name: 'Gestión de Usuarios' }
                  ].map(module => (
                    <div key={module.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px',
                      backgroundColor: 'white',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}>
                      <div>
                        <strong>{module.name}</strong><br/>
                        <small style={{ color: '#666' }}>
                          {selectedUser.permisos && selectedUser.permisos[module.id] ? 'Acceso concedido' : 'Acceso denegado'}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fechas */}
              <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Información de Tiempo</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <strong>Fecha de Creación:</strong><br/>
                    <span style={{ color: '#666', fontSize: '14px' }}>
                      {selectedUser.fecha_creacion ? 
                        new Date(selectedUser.fecha_creacion).toLocaleString('es-MX', {
                          day: '2-digit',
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 
                        'No disponible'
                      }
                    </span>
                  </div>
                  <div>
                    <strong>Última Actualización:</strong><br/>
                    <span style={{ color: '#666', fontSize: '14px' }}>
                      {selectedUser.fecha_actualizacion ? 
                        new Date(selectedUser.fecha_actualizacion).toLocaleString('es-MX', {
                          day: '2-digit',
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 
                        'No disponible'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleEdit(selectedUser)}
                >
                  Editar Usuario
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDelete(selectedUser.id)}
                >
                  Eliminar Usuario
                </button>
              </div>
            </div>

            {/* Navegación */}
            <div style={{ padding: '15px 20px', backgroundColor: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => navigateUser(currentIndex - 1)}
                disabled={currentIndex === 0}
                style={{ padding: '8px 16px' }}
              >
                « Anterior
              </button>
              <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                Usa las teclas <strong>«</strong> y <strong>»</strong> para navegar<br/>
                Presiona <strong>ESC</strong> para cerrar
              </div>
              <button 
                className="btn btn-secondary"
                onClick={() => navigateUser(currentIndex + 1)}
                disabled={currentIndex === usuarios.length - 1}
                style={{ padding: '8px 16px' }}
              >
                Siguiente »
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación Personalizado */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>
              Confirmar Eliminación
            </h3>
            <p style={{ margin: '0 0 24px 0', color: '#666' }}>
              ¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={cancelDelete}
                style={{ padding: '8px 16px' }}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmDelete}
                style={{ padding: '8px 16px' }}
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default Usuarios;
