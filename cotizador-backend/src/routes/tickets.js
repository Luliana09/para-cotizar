const express = require('express');
const router = express.Router();
const ticketsController = require('../controllers/ticketsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(protect);

// Rutas de tickets
router.get('/', ticketsController.getAll);
router.get('/stats/resumen', ticketsController.getEstadisticas);
router.get('/:id', ticketsController.getById);
router.post('/', ticketsController.create);
router.put('/:id', ticketsController.update);
router.patch('/:id/estado', ticketsController.cambiarEstado);
router.post('/:id/mensajes', ticketsController.agregarMensaje);
router.delete('/:id', authorize('admin'), ticketsController.delete);

module.exports = router;
