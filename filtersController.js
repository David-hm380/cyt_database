const pool = require('./db');

// Obtener módulos disponibles para filtros
const getAvailableModules = async (req, res) => {
  try {
    // Por ahora, solo terrenos está disponible
    const modules = ['terrenos'];
    
    res.json({
      success: true,
      modules: modules
    });
  } catch (error) {
    console.error('Error en getAvailableModules:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener módulos disponibles'
    });
  }
};

// Obtener configuración de filtros para un módulo específico
const getFilterConfig = async (req, res) => {
  try {
    const { modulo } = req.params;
    
    if (modulo !== 'terrenos') {
      return res.status(404).json({
        success: false,
        message: 'Módulo no encontrado'
      });
    }

    const filterConfig = {
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

    res.json({
      success: true,
      data: filterConfig
    });
  } catch (error) {
    console.error('Error en getFilterConfig:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración de filtros'
    });
  }
};

// Obtener opciones para filtros dependientes
const getFilterOptions = async (req, res) => {
  try {
    const { campo, valor_padre } = req.query;
    
    let options = [];
    
    if (campo === 'fraccionamiento' && valor_padre) {
      // Obtener fraccionamientos por zona
      const result = await pool.query(
        'SELECT DISTINCT fraccionamiento FROM terrenos WHERE LOWER(zona) = LOWER($1) AND fraccionamiento IS NOT NULL ORDER BY fraccionamiento',
        [valor_padre]
      );
      options = result.rows.map(row => row.fraccionamiento);
    }
    
    res.json({
      success: true,
      options: options
    });
  } catch (error) {
    console.error('Error en getFilterOptions:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener opciones de filtros'
    });
  }
};

// Ejecutar filtros dinámicos
const executeFilters = async (req, res) => {
  try {
    const { modulo } = req.params;
    const { filtros } = req.body;
    
    if (modulo !== 'terrenos') {
      return res.status(404).json({
        success: false,
        message: 'Módulo no encontrado'
      });
    }

    // Construir consulta SQL dinámica
    let query = 'SELECT * FROM terrenos WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Filtro por zona (texto parcial, case insensitive)
    if (filtros.zona && filtros.zona.trim()) {
      query += ` AND LOWER(zona) LIKE $${paramIndex}`;
      params.push(`%${filtros.zona.toLowerCase()}%`);
      paramIndex++;
    }

    // Filtro por fraccionamiento (texto parcial, case insensitive)
    if (filtros.fraccionamiento && filtros.fraccionamiento.trim()) {
      query += ` AND LOWER(fraccionamiento) LIKE $${paramIndex}`;
      params.push(`%${filtros.fraccionamiento.toLowerCase()}%`);
      paramIndex++;
    }

    // Filtro por uso_suelo (exacto)
    if (filtros.uso_suelo && filtros.uso_suelo.trim()) {
      query += ` AND uso_suelo = $${paramIndex}`;
      params.push(filtros.uso_suelo);
      paramIndex++;
    }

    // Filtro por categoria (texto parcial, case insensitive)
    if (filtros.categoria && filtros.categoria.trim()) {
      query += ` AND LOWER(categoria) LIKE $${paramIndex}`;
      params.push(`%${filtros.categoria.toLowerCase()}%`);
      paramIndex++;
    }

    // Filtro por regimen (texto parcial, case insensitive)
    if (filtros.regimen && filtros.regimen.trim()) {
      query += ` AND LOWER(regimen) LIKE $${paramIndex}`;
      params.push(`%${filtros.regimen.toLowerCase()}%`);
      paramIndex++;
    }

    // Filtro por precio_total (rango)
    if (filtros.precio_total) {
      if (filtros.precio_total.min) {
        query += ` AND (precio_m2 * metros_cuadrados) >= $${paramIndex}`;
        params.push(filtros.precio_total.min);
        paramIndex++;
      }
      if (filtros.precio_total.max) {
        query += ` AND (precio_m2 * metros_cuadrados) <= $${paramIndex}`;
        params.push(filtros.precio_total.max);
        paramIndex++;
      }
    }

    // Filtro por metros_cuadrados (rango o exacto)
    if (filtros.metros_cuadrados) {
      if (filtros.metros_cuadrados.exacto) {
        query += ` AND metros_cuadrados = $${paramIndex}`;
        params.push(filtros.metros_cuadrados.exacto);
        paramIndex++;
      } else {
        if (filtros.metros_cuadrados.min) {
          query += ` AND metros_cuadrados >= $${paramIndex}`;
          params.push(filtros.metros_cuadrados.min);
          paramIndex++;
        }
        if (filtros.metros_cuadrados.max) {
          query += ` AND metros_cuadrados <= $${paramIndex}`;
          params.push(filtros.metros_cuadrados.max);
          paramIndex++;
        }
      }
    }

    // Filtro por frente_metros (rango o exacto)
    if (filtros.frente_metros) {
      if (filtros.frente_metros.exacto) {
        query += ` AND frente_metros = $${paramIndex}`;
        params.push(filtros.frente_metros.exacto);
        paramIndex++;
      } else {
        if (filtros.frente_metros.min) {
          query += ` AND frente_metros >= $${paramIndex}`;
          params.push(filtros.frente_metros.min);
          paramIndex++;
        }
        if (filtros.frente_metros.max) {
          query += ` AND frente_metros <= $${paramIndex}`;
          params.push(filtros.frente_metros.max);
          paramIndex++;
        }
      }
    }

    // Filtro por fondo_metros (rango o exacto)
    if (filtros.fondo_metros) {
      if (filtros.fondo_metros.exacto) {
        query += ` AND fondo_metros = $${paramIndex}`;
        params.push(filtros.fondo_metros.exacto);
        paramIndex++;
      } else {
        if (filtros.fondo_metros.min) {
          query += ` AND fondo_metros >= $${paramIndex}`;
          params.push(filtros.fondo_metros.min);
          paramIndex++;
        }
        if (filtros.fondo_metros.max) {
          query += ` AND fondo_metros <= $${paramIndex}`;
          params.push(filtros.fondo_metros.max);
          paramIndex++;
        }
      }
    }

    // Filtro por precio_m2 (rango o exacto)
    if (filtros.precio_m2) {
      if (filtros.precio_m2.exacto) {
        query += ` AND precio_m2 = $${paramIndex}`;
        params.push(filtros.precio_m2.exacto);
        paramIndex++;
      } else {
        if (filtros.precio_m2.min) {
          query += ` AND precio_m2 >= $${paramIndex}`;
          params.push(filtros.precio_m2.min);
          paramIndex++;
        }
        if (filtros.precio_m2.max) {
          query += ` AND precio_m2 <= $${paramIndex}`;
          params.push(filtros.precio_m2.max);
          paramIndex++;
        }
      }
    }

    // Ordenamiento y límite
    query += ' ORDER BY created_at DESC LIMIT 100';

    console.log('Query ejecutada:', query);
    console.log('Parámetros:', params);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error en executeFilters:', error);
    res.status(500).json({
      success: false,
      message: 'Error al ejecutar filtros'
    });
  }
};

module.exports = {
  getAvailableModules,
  getFilterConfig,
  getFilterOptions,
  executeFilters
};
