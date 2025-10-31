const express = require('express');
const router = express.Router();
const cotizacionesController = require('../controllers/cotizacionesController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(protect);

// Estadísticas (antes de las rutas con :id)
router.get('/stats/resumen', cotizacionesController.getEstadisticas);

// Rutas CRUD de cotizaciones
router.get('/', cotizacionesController.getCotizaciones);
router.get('/:id', cotizacionesController.getCotizacion);
router.post('/', cotizacionesController.createCotizacion);
router.put('/:id', cotizacionesController.updateCotizacion);

// Cambiar estado
router.patch('/:id/estado', cotizacionesController.cambiarEstado);

// Solo admin puede eliminar cotizaciones
router.delete('/:id', authorize('admin'), cotizacionesController.deleteCotizacion);

module.exports = router;
