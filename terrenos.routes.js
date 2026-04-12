const express = require('express');
const router = express.Router();

const controller = require('./terrenos.controller');
const verifyToken = require('./authMiddleware');
const checkPermission = require('./permissionMiddleware');

// 🔐 TODAS protegidas
router.get('/', verifyToken, checkPermission('terrenos'), controller.getTerrenos);
router.get('/:id', verifyToken, checkPermission('terrenos'), controller.getTerrenoById);
router.post('/', verifyToken, checkPermission('terrenos'), controller.createTerreno);
router.put('/:id', verifyToken, checkPermission('terrenos'), controller.updateTerreno);
router.delete('/:id', verifyToken, checkPermission('terrenos'), controller.deleteTerreno);

module.exports = router;