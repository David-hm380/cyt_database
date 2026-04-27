const express = require('express');
const router = express.Router();
const filtersController = require('./filtersController');

// Obtener módulos disponibles para filtros
router.get('/modulos', filtersController.getAvailableModules);

// Obtener configuración de filtros para un módulo específico
router.get('/:modulo', filtersController.getFilterConfig);

// Obtener opciones para filtros dependientes
router.get('/options', filtersController.getFilterOptions);

// Ejecutar filtros dinámicos
router.post('/:modulo', filtersController.executeFilters);

module.exports = router;
