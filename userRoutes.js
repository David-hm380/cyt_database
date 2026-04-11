const express = require('express');
const router = express.Router();

const controller = require('../controllers/userController');
const verifyToken = require('../middlewares/authMiddleware');

// puedes proteger estos si quieres
router.get('/', verifyToken, controller.getUsers);
router.get('/:id/permisos', verifyToken, controller.getUserPermissions);
router.put('/:id', verifyToken, controller.updateUser);
router.delete('/:id', verifyToken, controller.deleteUser);

router.post('/login', controller.loginUser);
router.post('/', controller.createUser);

module.exports = router;