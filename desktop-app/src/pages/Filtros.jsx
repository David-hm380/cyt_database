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
    try {
      const response = await fetch(`https://cyt-database-1.onrender.com/api/filtros/${selectedModule}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setFilterConfig(data.data);
    } catch (error) {
      console.error('Error loading filter config:', error);
      // Fallback: usar configuración hardcoded
      console.log('Usando fallback de configuración de filtros...');
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
            tipo: 'select',
            etiqueta: 'Uso de Suelo',
            placeholder: 'Selecciona uso de suelo',
            opciones: ['habitacional', 'comercial', 'industrial', 'mixto', 'rural']
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
    }
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

  const executeFilters = async () => {
    setLoadingResults(true);
    try {
      const response = await fetch(`https://cyt-database-1.onrender.com/api/filtros/${selectedModule}`, {
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
    } catch (error) {
      console.error('Error executing filters:', error);
      setResults([]);
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
          <div style={{ marginBottom: '15px' }} key={filter.campo}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
              {filter.etiqueta}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleTextInput(e, (val) => handleFilterChange(filter.campo, val))}
              placeholder={filter.placeholder || 'Escribe aquí...'}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#ffffff'
              }}
            />
          </div>
        );

      case 'select':
        return (
          <div style={{ marginBottom: '15px' }} key={filter.campo}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
              {filter.etiqueta}
            </label>
            <select
              value={value}
              onChange={(e) => handleFilterChange(filter.campo, e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#ffffff'
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
          <div style={{ marginBottom: '15px' }} key={filter.campo}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
              {filter.etiqueta}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="text"
                placeholder={filter.min_label || 'Mínimo'}
                value={value?.min || ''}
                onChange={(e) => handleNumberInput(e, (val) => handleFilterChange(filter.campo, { ...value, min: val }))}
                style={{
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <input
                type="text"
                placeholder={filter.max_label || 'Máximo'}
                value={value?.max || ''}
                onChange={(e) => handleNumberInput(e, (val) => handleFilterChange(filter.campo, { ...value, max: val }))}
                style={{
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        );

      case 'rango_o_exacto':
        return (
          <div style={{ marginBottom: '15px' }} key={filter.campo}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
              {filter.etiqueta}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <input
                type="text"
                placeholder={filter.min_label || 'Mínimo'}
                value={value?.min || ''}
                onChange={(e) => handleNumberInput(e, (val) => handleFilterChange(filter.campo, { ...value, min: val, exacto: null }))}
                style={{
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <input
                type="text"
                placeholder={filter.max_label || 'Máximo'}
                value={value?.max || ''}
                onChange={(e) => handleNumberInput(e, (val) => handleFilterChange(filter.campo, { ...value, max: val, exacto: null }))}
                style={{
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <input
                type="text"
                placeholder={filter.exacto_label || 'Exacto'}
                value={value?.exacto || ''}
                onChange={(e) => handleNumberInput(e, (val) => handleFilterChange(filter.campo, { exacto: val, min: null, max: null }))}
                style={{
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
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
            style={{ marginRight: '10px' }}
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
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Page Header */}
        <div className="page-header" style={{ marginBottom: '30px' }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#1f2937' 
          }}>
            Filtros de Búsqueda
          </h1>
          <p style={{ 
            margin: '8px 0 0 0', 
            color: '#6b7280', 
            fontSize: '16px' 
          }}>
            Encuentra propiedades según tus criterios
          </p>
        </div>

        {/* Module Selection */}
        {!selectedModule && (
          <div style={{ 
            backgroundColor: '#ffffff', 
            padding: '30px', 
            borderRadius: '12px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
          }}>
            <h2 style={{ 
              marginBottom: '20px', 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#1f2937' 
            }}>
              Selecciona un Módulo
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '15px' 
            }}>
              {modules.map(module => (
                <button
                  key={module}
                  onClick={() => setSelectedModule(module)}
                  style={{
                    padding: '20px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#374151'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.backgroundColor = '#eff6ff';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.backgroundColor = '#ffffff';
                  }}
                >
                  {module.charAt(0).toUpperCase() + module.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Results */}
        {selectedModule && filterConfig && (
          <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '20px' }}>
            {/* Filters Panel */}
            <div style={{ 
              backgroundColor: '#ffffff', 
              padding: '25px', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              height: 'fit-content'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px' 
              }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#1f2937' 
                }}>
                  Filtros
                </h3>
                <button
                  onClick={() => setSelectedModule('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {selectedModule.charAt(0).toUpperCase() + selectedModule.slice(1)}
                </span>
              </div>

              {/* General Filters */}
              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ 
                  margin: '0 0 15px 0', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Filtros Generales
                </h4>
                {filterConfig.filtros_generales.map(filter => renderFilter(filter))}
              </div>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: '#f9fafb',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '15px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                }}
              >
                {showAdvanced ? '−' : '+'} Filtros Avanzados
              </button>

              {/* Advanced Filters */}
              {showAdvanced && (
                <div style={{ marginBottom: '25px' }}>
                  <h4 style={{ 
                    margin: '0 0 15px 0', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Filtros Avanzados
                  </h4>
                  {filterConfig.filtros_avanzados.map(filter => renderFilter(filter, true))}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'grid', gap: '10px' }}>
                <button
                  onClick={executeFilters}
                  disabled={loadingResults}
                  style={{
                    padding: '12px',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#2563eb';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#3b82f6';
                  }}
                >
                  {loadingResults ? 'Buscando...' : 'Aplicar Filtros'}
                </button>
                <button
                  onClick={resetFilters}
                  style={{
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>

            {/* Results Panel */}
            <div style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <div style={{ 
                padding: '20px', 
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb'
              }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#1f2937' 
                }}>
                  Resultados {results.length > 0 && `(${results.length})`}
                </h3>
              </div>

              <div style={{ padding: '20px' }}>
                {loadingResults ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    color: '#6b7280' 
                  }}>
                    Buscando resultados...
                  </div>
                ) : results.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    color: '#6b7280' 
                  }}>
                    {Object.keys(filters).length === 0 
                      ? 'Selecciona filtros y haz clic en "Aplicar Filtros"'
                      : 'No se encontraron resultados para los filtros seleccionados'
                    }
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse',
                      fontSize: '14px'
                    }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f9fafb' }}>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>ID</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Zona</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Fraccionamiento</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Uso Suelo</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Metros</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Precio Total</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((result, index) => (
                          <tr 
                            key={result.id}
                            style={{ 
                              borderBottom: '1px solid #f3f4f6',
                              backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb'
                            }}
                          >
                            <td style={{ padding: '12px' }}>{result.id}</td>
                            <td style={{ padding: '12px' }}>{result.zona}</td>
                            <td style={{ padding: '12px' }}>{result.fraccionamiento}</td>
                            <td style={{ padding: '12px' }}>{result.uso_suelo}</td>
                            <td style={{ padding: '12px' }}>{result.metros_cuadrados}</td>
                            <td style={{ padding: '12px' }}>
                              ${(result.precio_m2 * result.metros_cuadrados).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px' }}>{result.stock}</td>
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
      </div>
    </div>
  );
}

export default Filtros;
