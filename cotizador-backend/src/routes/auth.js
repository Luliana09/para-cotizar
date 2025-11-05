const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/login', authController.login);

// Rutas protegidas
router.get('/me', protect, authController.getMe);
router.put('/cambiar-password', protect, authController.cambiarPassword);

// Rutas solo para admin
router.post('/register', protect, authorize('admin'), authController.register);

module.exports = router;
