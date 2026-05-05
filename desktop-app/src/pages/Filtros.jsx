import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Filtros() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [filterConfig, setFilterConfig] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPermissionDenied, setShowPermissionDenied] = useState(false);
  const [deniedModule, setDeniedModule] = useState('');

  // Función para validar que solo se ingresen números
  const handleNumberInput = (e, callback) => {
    const value = e.target.value;
    // Permitir solo números, puntos y comas (para decimales)
    const numericValue = value.replace(/[^0-9.,]/g, '');
    e.target.value = numericValue;
    callback(numericValue);
  };

  // Función para limpiar texto de filtros (quitar espacios y normalizar)
  const handleTextInput = (e, callback) => {
    const value = e.target.value;
    // Limpiar espacios al inicio y final
    const cleanValue = value.trim();
    e.target.value = cleanValue;
    callback(cleanValue);
  };

  // Cargar módulos disponibles
  useEffect(() => {
    loadModules();
  }, []);

  // Cargar configuración cuando se selecciona módulo
  useEffect(() => {
    if (selectedModule) {
      loadFilterConfig();
      resetFilters();
    }
  }, [selectedModule]);

  const loadModules = async () => {
    try {
      const response = await fetch('https://cyt-database-1.onrender.com/api/filtros/modulos', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      console.log('Respuesta del backend:', data);
      setModules(data.modules || []);
    } catch (error) {
      console.error('Error loading modules:', error);
      // Fallback: usar módulos hardcoded
      console.log('Usando fallback de módulos...');
      setModules(['terrenos']);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterConfig = async () => {
    // Forzar uso de configuración local para asegurar que uso_suelo sea text
    console.log('Usando configuración local de filtros...');
    const fallbackConfig = {
        filtros_generales: [
          {
            campo: 'zona',
            tipo: 'text',
            etiqueta: 'Zona',
            placeholder: 'Escribe la zona...'
          },
          {
            campo: 'fraccionamiento',
            tipo: 'text',
            etiqueta: 'Fraccionamiento',
            placeholder: 'Escribe el fraccionamiento...'
          },
          {
            campo: 'uso_suelo',
            tipo: 'text',
            etiqueta: 'Uso de Suelo',
            placeholder: 'Escribe el uso de suelo...'
          },
          {
            campo: 'precio_total',
            tipo: 'rango',
            etiqueta: 'Precio Total',
            min_label: 'Precio Mínimo',
            max_label: 'Precio Máximo'
          }
        ],
        filtros_avanzados: [
          {
            campo: 'metros_cuadrados',
            tipo: 'rango_o_exacto',
            etiqueta: 'Metros Cuadrados',
            min_label: 'Metros Mínimos',
            max_label: 'Metros Máximos',
            exacto_label: 'Metros Exactos'
          },
          {
            campo: 'frente_metros',
            tipo: 'rango_o_exacto',
            etiqueta: 'Frente (m)',
            min_label: 'Frente Mínimo',
            max_label: 'Frente Máximo',
            exacto_label: 'Frente Exacto'
          },
          {
            campo: 'fondo_metros',
            tipo: 'rango_o_exacto',
            etiqueta: 'Fondo (m)',
            min_label: 'Fondo Mínimo',
            max_label: 'Fondo Máximo',
            exacto_label: 'Fondo Exacto'
          },
          {
            campo: 'precio_m2',
            tipo: 'rango_o_exacto',
            etiqueta: 'Precio por m²',
            min_label: 'Precio Mínimo',
            max_label: 'Precio Máximo',
            exacto_label: 'Precio Exacto'
          },
          {
            campo: 'categoria',
            tipo: 'text',
            etiqueta: 'Categoría',
            placeholder: 'Escribe la categoría...'
          },
          {
            campo: 'regimen',
            tipo: 'text',
            etiqueta: 'Régimen',
            placeholder: 'Escribe el régimen...'
          }
        ]
      };
      setFilterConfig(fallbackConfig);
  };

  const loadFilterOptions = async (campo, valorPadre) => {
    try {
      const response = await fetch(`https://cyt-database-1.onrender.com/api/filtros/options?campo=${campo}&valor_padre=${valorPadre}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.options || [];
    } catch (error) {
      console.error('Error loading filter options:', error);
      return [];
    }
  };

  const resetFilters = () => {
    setFilters({});
    setResults([]);
    setShowAdvanced(false);
    setPagination(null);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && pagination && newPage <= pagination.totalPages) {
      executeFilters(newPage);
    }
  };

  const handleRowDoubleClick = (result) => {
    // Verificar si el usuario tiene permisos para el módulo
    const modulePermission = selectedModule;
    
    console.log('Verificando permisos para módulo:', modulePermission);
    console.log('Permisos del usuario:', user.permisos);
    
    // Los permisos vienen como objeto: { terrenos: true, usuarios: false }
    const hasPermission = user.permisos && user.permisos[modulePermission] === true;
    
    console.log('¿Tiene permiso?', hasPermission);
    
    if (!hasPermission) {
      // Mostrar modal personalizado en lugar de alert()
      const moduleName = modulePermission.charAt(0).toUpperCase() + modulePermission.slice(1);
      setDeniedModule(moduleName);
      setShowPermissionDenied(true);
      return;
    }

    // Guardar el elemento seleccionado en localStorage para que el módulo lo cargue
    localStorage.setItem('selectedItem', JSON.stringify({
      id: result.id,
      module: selectedModule,
      fromFilters: true
    }));

    // Navegar al módulo específico
    navigate(`/${selectedModule}`);
  };

  const handleFilterChange = async (campo, valor) => {
    const newFilters = { ...filters, [campo]: valor };
    setFilters(newFilters);

    // Cargar opciones para filtros dependientes
    if (filterConfig) {
      const dependentFilters = filterConfig.filtros_generales
        .filter(f => f.tipo === 'select_dependiente' && f.depende_de === campo);

      for (const dependentFilter of dependentFilters) {
        const options = await loadFilterOptions(dependentFilter.campo, valor);
        setFilterOptions(prev => ({
          ...prev,
          [dependentFilter.campo]: options
        }));
      }
    }
  };

  const executeFilters = async (page = 1) => {
    setLoadingResults(true);
    try {
      const response = await fetch(`https://cyt-database-1.onrender.com/api/filtros/${selectedModule}?page=${page}&limit=50`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ filtros: filters })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Resultados del backend:', data);
      setResults(data.data || []);
      setPagination(data.pagination || null);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error executing filters:', error);
      setResults([]);
      setPagination(null);
      alert('Error al ejecutar filtros. Por favor verifica que el backend esté corriendo en Render.');
    } finally {
      setLoadingResults(false);
    }
  };

  const renderFilter = (filter, isAdvanced = false) => {
    const value = filters[filter.campo] || '';

    switch (filter.tipo) {
      case 'text':
        return (
          <div style={{ marginBottom: '4px' }} key={filter.campo}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
              {filter.etiqueta}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleTextInput(e, (val) => handleFilterChange(filter.campo, val))}
              placeholder={filter.placeholder || 'Escribe aquí...'}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#ffffff',
                transition: 'all 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        );

      case 'select':
        return (
          <div style={{ marginBottom: '4px' }} key={filter.campo}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
              {filter.etiqueta}
            </label>
            <select
              value={value}
              onChange={(e) => handleFilterChange(filter.campo, e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#ffffff',
                transition: 'all 0.2s',
                outline: 'none',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">{filter.placeholder || 'Seleccionar...'}</option>
              {filter.opciones?.map(opcion => (
                <option key={opcion} value={opcion}>
                  {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
                </option>
              ))}
            </select>
          </div>
        );

      case 'select_dependiente':
        return (
          <div style={{ marginBottom: '15px' }} key={filter.campo}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
              {filter.etiqueta}
            </label>
            <select
              value={value}
              onChange={(e) => handleFilterChange(filter.campo, e.target.value)}
              disabled={!filters[filter.depende_de]}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: filters[filter.depende_de] ? '#ffffff' : '#f3f4f6'
              }}
            >
              <option value="">{filter.placeholder || 'Seleccionar...'}</option>
              {filterOptions[filter.campo]?.map((opcion, index) => (
                <option key={index} value={opcion.fraccionamiento || opcion}>
                  {opcion.fraccionamiento || opcion}
                </option>
              ))}
            </select>
          </div>
        );

      case 'rango':
        return (
          <div style={{ marginBottom: '4px' }} key={filter.campo}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
              {filter.etiqueta}
            </label>
            {/* Dos filas separadas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="text"
                placeholder="Mínimo"
                value={value?.min || ''}
                onChange={(e) => handleNumberInput(e, (val) => handleFilterChange(filter.campo, { ...value, min: val }))}
                style={{
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  outline: 'none',
                  width: '100%'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <input
                type="text"
                placeholder="Máximo"
                value={value?.max || ''}
                onChange={(e) => handleNumberInput(e, (val) => handleFilterChange(filter.campo, { ...value, max: val }))}
                style={{
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  outline: 'none',
                  width: '100%'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        );

      case 'rango_o_exacto':
        return (
          <div style={{ marginBottom: '4px' }} key={filter.campo}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
              {filter.etiqueta}
            </label>
            {/* Tres filas separadas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="text"
                placeholder="Mínimo"
                value={value?.min || ''}
                onChange={(e) => handleNumberInput(e, (val) => handleFilterChange(filter.campo, { ...value, min: val, exacto: null }))}
                style={{
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  outline: 'none',
                  width: '100%'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <input
                type="text"
                placeholder="Máximo"
                value={value?.max || ''}
                onChange={(e) => handleNumberInput(e, (val) => handleFilterChange(filter.campo, { ...value, max: val, exacto: null }))}
                style={{
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  outline: 'none',
                  width: '100%'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <input
                type="text"
                placeholder="Exacto"
                value={value?.exacto || ''}
                onChange={(e) => handleNumberInput(e, (val) => handleFilterChange(filter.campo, { exacto: val, min: null, max: null }))}
                style={{
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  outline: 'none',
                  width: '100%'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px',
        color: '#6b7280'
      }}>
        Cargando filtros...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
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
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary btn-sm"
            style={{ marginRight: '8px' }}
          >
            ← Dashboard
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
            }}
            className="btn btn-danger btn-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#0f172a',
            letterSpacing: '-0.025em'
          }}>
            Filtros de Búsqueda
          </h1>
          <p style={{ 
            margin: '8px 0 0 0', 
            color: '#64748b', 
            fontSize: '16px',
            fontWeight: '400'
          }}>
            Encuentra propiedades según tus criterios específicos
          </p>
        </div>

        {/* Module Selection */}
        {!selectedModule && (
          <div style={{ 
            backgroundColor: '#ffffff', 
            padding: '40px', 
            borderRadius: '16px', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{ 
              marginBottom: '24px', 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#0f172a' 
            }}>
              Selecciona un Módulo
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
              gap: '16px' 
            }}>
              {modules.map(module => (
                <button
                  key={module}
                  onClick={() => setSelectedModule(module)}
                  style={{
                    padding: '24px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#475569',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.backgroundColor = '#f8fafc';
                    e.target.style.color = '#3b82f6';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.color = '#475569';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ 
                    fontSize: '24px', 
                    marginBottom: '8px',
                    fontWeight: '700'
                  }}>
                    {module.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    {module.charAt(0).toUpperCase() + module.slice(1)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Results */}
        {selectedModule && filterConfig && (
          <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px' }}>
            {/* Filters Panel */}
            <div style={{ 
              backgroundColor: '#ffffff', 
              padding: '32px', 
              borderRadius: '16px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e2e8f0',
              height: 'fit-content',
              position: 'sticky',
              top: '24px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '24px' 
              }}>
                <div>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: '#0f172a',
                    letterSpacing: '-0.025em'
                  }}>
                    Filtros
                  </h3>
                  <div style={{ 
                    marginTop: '4px',
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {selectedModule.charAt(0).toUpperCase() + selectedModule.slice(1)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedModule('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '20px',
                    padding: '4px',
                    borderRadius: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#f1f5f9';
                    e.target.style.color = '#64748b';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#94a3b8';
                  }}
                >
                  ×
                </button>
              </div>

              {/* General Filters */}
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Filtros Generales
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filterConfig.filtros_generales.map(filter => renderFilter(filter))}
                </div>
              </div>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#475569',
                  marginBottom: '16px',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f1f5f9';
                  e.target.style.borderColor = '#cbd5e1';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.borderColor = '#e2e8f0';
                }}
              >
                <span>Filtros Avanzados</span>
                <span style={{ 
                  fontSize: '18px',
                  fontWeight: '400',
                  color: '#94a3b8'
                }}>
                  {showAdvanced ? '−' : '+'}
                </span>
              </button>

              {/* Advanced Filters */}
              {showAdvanced && (
                <div style={{ marginBottom: '32px' }}>
                  <h4 style={{ 
                    margin: '0 0 16px 0', 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Filtros Avanzados
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filterConfig.filtros_avanzados.map(filter => renderFilter(filter, true))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '32px' }}>
                <button
                  onClick={() => executeFilters(1)}
                  disabled={loadingResults}
                  style={{
                    padding: '14px 20px',
                    border: 'none',
                    borderRadius: '10px',
                    backgroundColor: loadingResults ? '#94a3b8' : '#3b82f6',
                    color: '#ffffff',
                    cursor: loadingResults ? 'not-allowed' : 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: loadingResults ? 'none' : '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    if (!loadingResults) {
                      e.target.style.backgroundColor = '#2563eb';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.3)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loadingResults) {
                      e.target.style.backgroundColor = '#3b82f6';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.3)';
                    }
                  }}
                >
                  {loadingResults ? 'Buscando...' : 'Aplicar Filtros'}
                </button>
                <button
                  onClick={resetFilters}
                  style={{
                    padding: '14px 20px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '500',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#f8fafc';
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.color = '#475569';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.color = '#64748b';
                  }}
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>

            {/* Results Panel */}
            <div style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '16px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}>
              <div style={{ 
                padding: '24px', 
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: '#0f172a',
                    letterSpacing: '-0.025em'
                  }}>
                    Resultados {results.length > 0 && (
                      <span style={{ 
                        color: '#64748b', 
                        fontWeight: '500',
                        fontSize: '16px'
                      }}>
                        {' '}({results.length})
                      </span>
                    )}
                  </h3>
                  {results.length > 0 && (
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#64748b',
                      fontWeight: '500'
                    }}>
                      {results.length} propiedad{results.length !== 1 ? 'es' : ''} encontrada{results.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* Indicador de doble click */}
              <div style={{ 
                padding: '12px 24px', 
                backgroundColor: '#f0f9ff', 
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ 
                  fontSize: '16px',
                  color: '#0369a1'
                }}>
                  ℹ️
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#0369a1',
                  fontWeight: '500'
                }}>
                  Doble click en cualquier resultado para ver detalles completos en el módulo de {selectedModule}
                </div>
              </div>

              <div style={{ padding: '24px' }}>
                {loadingResults ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px', 
                    color: '#64748b'
                  }}>
                    <div style={{ 
                      fontSize: '48px', 
                      marginBottom: '16px',
                      opacity: '0.5'
                    }}>
                      🔍
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '500' }}>
                      Buscando resultados...
                    </div>
                  </div>
                ) : results.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px', 
                    color: '#64748b'
                  }}>
                    <div style={{ 
                      fontSize: '48px', 
                      marginBottom: '16px',
                      opacity: '0.5'
                    }}>
                      📋
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                      {Object.keys(filters).length === 0 
                        ? 'Selecciona filtros y haz clic en "Aplicar Filtros"'
                        : 'No se encontraron resultados para los filtros seleccionados'
                      }
                    </div>
                    <div style={{ fontSize: '14px', opacity: '0.7' }}>
                      {Object.keys(filters).length === 0 
                        ? 'Usa los filtros de la izquierda para buscar propiedades'
                        : 'Intenta ajustar los criterios de búsqueda'
                      }
                    </div>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse',
                      fontSize: '14px'
                    }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                          <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID</th>
                          <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Zona</th>
                          <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fraccionamiento</th>
                          <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Uso Suelo</th>
                          <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Metros</th>
                          <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Precio Total</th>
                          <th style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: '600', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock</th>
                          <th style={{ padding: '16px 12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', fontWeight: '600', color: '#475569', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acceso</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((result, index) => (
                          <tr 
                            key={result.id}
                            onDoubleClick={() => handleRowDoubleClick(result)}
                            style={{ 
                              borderBottom: '1px solid #f3f4f6',
                              backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#e0f2fe';
                              e.currentTarget.style.transform = 'scale(1.01)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                            title={
                              user.permisos && user.permisos[selectedModule] === true
                                ? `Doble click para ver detalles de ${selectedModule} #${result.id}`
                                : `No tienes permiso para acceder a ${selectedModule}. Doble click para solicitar acceso.`
                            }
                          >
                            <td style={{ padding: '12px', fontWeight: '500' }}>{result.id}</td>
                            <td style={{ padding: '12px' }}>{result.zona}</td>
                            <td style={{ padding: '12px' }}>{result.fraccionamiento}</td>
                            <td style={{ padding: '12px' }}>{result.uso_suelo}</td>
                            <td style={{ padding: '12px' }}>{result.metros_cuadrados}</td>
                            <td style={{ padding: '12px' }}>
                              ${(result.precio_m2 * result.metros_cuadrados).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px' }}>{result.stock}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              {user.permisos && user.permisos[selectedModule] === true ? (
                                <span style={{ 
                                  color: '#10b981', 
                                  fontSize: '18px',
                                  title: 'Tienes acceso a este módulo'
                                }}>
                                  ✓
                                </span>
                              ) : (
                                <span style={{ 
                                  color: '#ef4444', 
                                  fontSize: '18px',
                                  title: 'No tienes acceso a este módulo'
                                }}>
                                  ✗
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Modal de Permiso Denegado */}
      {showPermissionDenied && (
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
            width: '90%',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '48px',
              color: '#ef4444',
              marginBottom: '16px'
            }}>
              🚫
            </div>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              color: '#333',
              fontSize: '20px',
              fontWeight: '600'
            }}>
              Acceso Denegado
            </h3>
            <p style={{ 
              margin: '0 0 24px 0', 
              color: '#666',
              lineHeight: '1.5'
            }}>
              No tienes permisos para acceder al módulo de <strong>{deniedModule}</strong>.<br/><br/>
              Contacta al administrador para solicitar acceso.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowPermissionDenied(false);
                setDeniedModule('');
              }}
              style={{ 
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default Filtros;
