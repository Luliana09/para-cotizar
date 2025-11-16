const express = require('express');
const router = express.Router();
const departamentosController = require('../controllers/departamentosController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(protect);

// Rutas de departamentos
router.get('/', departamentosController.getAll);
router.post('/', authorize('admin'), departamentosController.create);
router.put('/:id', authorize('admin'), departamentosController.update);
router.delete('/:id', authorize('admin'), departamentosController.delete);

module.exports = router;
