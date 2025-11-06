const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/login', authController.login);
router.post('/registro-publico', authController.registroPublico);

// Rutas protegidas
router.get('/me', protect, authController.getMe);
router.put('/cambiar-password', protect, authController.cambiarPassword);

// Rutas solo para admin
router.post('/register', protect, authorize('admin'), authController.register);
router.get('/usuarios', protect, authorize('admin'), authController.getUsuarios);
router.get('/usuarios/:id', protect, authorize('admin'), authController.getUsuario);
router.put('/usuarios/:id', protect, authorize('admin'), authController.updateUsuario);
router.delete('/usuarios/:id', protect, authorize('admin'), authController.deleteUsuario);

module.exports = router;
