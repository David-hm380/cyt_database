import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import terrenosService from '../services/terrenosService';

function Terrenos() {
  const [terrenos, setTerrenos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTerreno, setEditingTerreno] = useState(null);
  const [formData, setFormData] = useState({
    zona: '',
    fraccionamiento: '',
    uso_suelo: '',
    regimen: '',
    categoria: '',
    tipo: '',
    precio_m2: '',
    metros_cuadrados: '',
    frente_metros: '',
    fondo_metros: '',
    stock: '',
    entrega: '',
    ubicacion: '',
    vigencia_precio: '',
    contacto_nombre: '',
    contacto_telefono: ''
  });
  const [selectedTerreno, setSelectedTerreno] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si viene de filtros con un elemento seleccionado
    const selectedItem = localStorage.getItem('selectedItem');
    if (selectedItem) {
      const parsed = JSON.parse(selectedItem);
      if (parsed.fromFilters && parsed.module === 'terrenos') {
        // Viene de filtros, cargar solo el terreno específico
        loadSpecificTerreno(parsed.id);
        // Limpiar el localStorage para no afectar futuras navegaciones
        localStorage.removeItem('selectedItem');
      } else {
        // Cargar terrenos paginados normalmente
        loadTerrenosPaginated();
      }
    } else {
      // Cargar terrenos paginados normalmente
      loadTerrenosPaginated();
    }
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedTerreno) return;

      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          navigateTerreno(currentIndex - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateTerreno(currentIndex + 1);
          break;
        case 'Escape':
          e.preventDefault();
          setSelectedTerreno(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedTerreno, currentIndex, terrenos.length]);

  const loadTerrenosPaginated = async (page = 1, append = false) => {
    try {
      setLoading(true);
      const response = await terrenosService.getPaginated(page, 20);
      
      if (append) {
        setTerrenos(prev => [...prev, ...response.data]);
      } else {
        setTerrenos(response.data);
      }
      
      setPagination(response.pagination);
      setHasMore(response.pagination.hasNext);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      setError('Error al cargar los terrenos: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const loadMoreTerrenos = () => {
    if (hasMore && !loading) {
      loadTerrenosPaginated(currentPage + 1, true);
    }
  };

  const loadSpecificTerreno = async (selectedId) => {
    try {
      setLoading(true);
      const terreno = await terrenosService.getById(selectedId);
      
      if (terreno) {
        setSelectedTerreno(terreno);
        setError(null);
      } else {
        setError(`No se encontró el terreno con ID ${selectedId}`);
      }
    } catch (err) {
      setError('Error al cargar el terreno: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (terreno, index) => {
    setSelectedTerreno(terreno);
    setCurrentIndex(index);
  };

  const navigateTerreno = (newIndex) => {
    if (newIndex >= 0 && newIndex < terrenos.length) {
      setSelectedTerreno(terrenos[newIndex]);
      setCurrentIndex(newIndex);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTerreno) {
        await terrenosService.update(editingTerreno.id, formData);
      } else {
        await terrenosService.create(formData);
      }
      
      resetForm();
      setShowForm(false);
      loadTerrenos();
    } catch (err) {
      setError('Error al guardar el terreno: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (terreno) => {
    setEditingTerreno(terreno);
    setSelectedTerreno(null); // Cerrar vista de detalles
    
    // Formatear la fecha para el input type="date"
    const formattedTerreno = {
      ...terreno,
      vigencia_precio: terreno.vigencia_precio ? 
        new Date(terreno.vigencia_precio).toISOString().split('T')[0] : 
        ''
    };
    
    setFormData(formattedTerreno);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este terreno?')) {
      try {
        await terrenosService.delete(id);
        
        // Si el terreno eliminado era el seleccionado, limpiar selección
        if (selectedTerreno && selectedTerreno.id === id) {
          setSelectedTerreno(null);
        }
        
        loadTerrenos();
      } catch (err) {
        setError('Error al eliminar el terreno: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      zona: '',
      fraccionamiento: '',
      uso_suelo: '',
      regimen: '',
      categoria: '',
      tipo: '',
      precio_m2: '',
      metros_cuadrados: '',
      frente_metros: '',
      fondo_metros: '',
      stock: '',
      entrega: '',
      ubicacion: '',
      vigencia_precio: '',
      contacto_nombre: '',
      contacto_telefono: ''
    });
    setEditingTerreno(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('handleChange Terrenos:', { name, value });
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div className="loading">Cargando terrenos...</div>;
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
            <h1 className="page-title">Gestión de Terrenos</h1>
            <p style={{ 
              color: 'var(--text-secondary)', 
              marginTop: '8px',
              fontSize: '16px'
            }}>
              Administra terrenos y propiedades inmobiliarias
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
            Nuevo Terreno
          </button>
        </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '600px' }}>
            <div className="modal-header">
              <h3>{editingTerreno ? 'Editar Terreno' : 'Nuevo Terreno'}</h3>
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
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label>Zona:</label>
                    <input
                      type="text"
                      name="zona"
                      value={formData.zona}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div>
                    <label>Fraccionamiento:</label>
                    <input
                      type="text"
                      name="fraccionamiento"
                      value={formData.fraccionamiento}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div>
                    <label>Uso de Suelo:</label>
                    <input
                      type="text"
                      name="uso_suelo"
                      value={formData.uso_suelo}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div>
                    <label>Régimen:</label>
                    <input
                      type="text"
                      name="regimen"
                      value={formData.regimen}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div>
                    <label>Categoría:</label>
                    <input
                      type="text"
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div>
                    <label>Tipo:</label>
                    <input
                      type="text"
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div>
                    <label>Precio por m²:</label>
                    <input
                      type="number"
                      name="precio_m2"
                      value={formData.precio_m2}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div>
                    <label>Metros Cuadrados:</label>
                    <input
                      type="number"
                      name="metros_cuadrados"
                      value={formData.metros_cuadrados}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div>
                    <label>Frente (m):</label>
                    <input
                      type="number"
                      name="frente_metros"
                      value={formData.frente_metros}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div>
                    <label>Fondo (m):</label>
                    <input
                      type="number"
                      name="fondo_metros"
                      value={formData.fondo_metros}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div>
                    <label>Stock:</label>
                    <input
                      type="text"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div>
                    <label>Entrega:</label>
                    <input
                      type="text"
                      name="entrega"
                      value={formData.entrega}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label>Ubicación:</label>
                    <input
                      type="text"
                      name="ubicacion"
                      value={formData.ubicacion}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div>
                    <label>Vigencia Precio:</label>
                    <input
                      type="date"
                      name="vigencia_precio"
                      value={formData.vigencia_precio}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>

                  <div>
                    <label>Contacto Nombre:</label>
                    <input
                      type="text"
                      name="contacto_nombre"
                      value={formData.contacto_nombre}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label>Contacto Teléfono:</label>
                    <input
                      type="text"
                      name="contacto_telefono"
                      value={formData.contacto_telefono}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
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
                  {editingTerreno ? 'Actualizar' : 'Crear'}
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
              <th>Zona</th>
              <th>Fraccionamiento</th>
              <th>Precio/m²</th>
              <th>Precio Total</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {terrenos.map((terreno, index) => (
              <tr 
                key={terreno.id}
                onClick={() => handleViewDetails(terreno, index)}
                style={{ cursor: 'pointer' }}
              >
                <td>{terreno.id}</td>
                <td>{terreno.zona}</td>
                <td>{terreno.fraccionamiento}</td>
                <td>${parseFloat(terreno.precio_m2).toLocaleString()}</td>
                <td>${(parseFloat(terreno.precio_m2) * parseFloat(terreno.metros_cuadrados)).toLocaleString()}</td>
                <td>{terreno.stock}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(terreno);
                    }}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(terreno.id);
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

      {selectedTerreno && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '800px', maxHeight: '90vh' }}>
            <div className="modal-header">
              <h3>Detalles del Terreno</h3>
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedTerreno(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {/* Información básica */}
              <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Información del Terreno</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div><strong>ID:</strong> {selectedTerreno.id}</div>
                  <div><strong>Zona:</strong> {selectedTerreno.zona}</div>
                  <div><strong>Fraccionamiento:</strong> {selectedTerreno.fraccionamiento}</div>
                  <div><strong>Uso de Suelo:</strong> {selectedTerreno.uso_suelo}</div>
                  <div><strong>Régimen:</strong> {selectedTerreno.regimen}</div>
                  <div><strong>Categoría:</strong> {selectedTerreno.categoria}</div>
                  <div><strong>Tipo:</strong> {selectedTerreno.tipo}</div>
                  <div><strong>Precio/m²:</strong> ${parseFloat(selectedTerreno.precio_m2).toLocaleString()}</div>
                  <div><strong>Metros Cuadrados:</strong> {selectedTerreno.metros_cuadrados} m²</div>
                  <div><strong>Frente:</strong> {selectedTerreno.frente_metros} m</div>
                  <div><strong>Fondo:</strong> {selectedTerreno.fondo_metros} m</div>
                  <div><strong>Stock:</strong> {selectedTerreno.stock}</div>
                  <div><strong>Total:</strong> ${(parseFloat(selectedTerreno.precio_m2) * parseFloat(selectedTerreno.metros_cuadrados)).toLocaleString()}</div>
                </div>
              </div>

              {/* Ubicación y Contacto */}
              <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Ubicación y Contacto</h4>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div><strong>Entrega:</strong> {selectedTerreno.entrega}</div>
                  <div><strong>Ubicación:</strong> {selectedTerreno.ubicacion}</div>
                  <div><strong>Contacto:</strong> {selectedTerreno.contacto_nombre}</div>
                  <div><strong>Teléfono:</strong> {selectedTerreno.contacto_telefono}</div>
                  <div><strong>Vigencia Precio:</strong> {selectedTerreno.vigencia_precio ? new Date(selectedTerreno.vigencia_precio).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>

              {/* Fechas */}
              <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Información de Tiempo</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <strong>Fecha de Creación:</strong><br/>
                    <span style={{ color: '#666', fontSize: '14px' }}>
                      {selectedTerreno.fecha_creacion ? 
                        new Date(selectedTerreno.fecha_creacion).toLocaleString('es-MX', {
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
                      {selectedTerreno.fecha_actualizacion ? 
                        new Date(selectedTerreno.fecha_actualizacion).toLocaleString('es-MX', {
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
                  onClick={() => handleEdit(selectedTerreno)}
                >
                  Editar Terreno
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDelete(selectedTerreno.id)}
                >
                  Eliminar Terreno
                </button>
              </div>
            </div>

            {/* Navegación */}
            <div style={{ padding: '15px 20px', backgroundColor: '#f8f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => navigateTerreno(currentIndex - 1)}
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
                onClick={() => navigateTerreno(currentIndex + 1)}
                disabled={currentIndex === terrenos.length - 1}
                style={{ padding: '8px 16px' }}
              >
                Siguiente »
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default Terrenos;
