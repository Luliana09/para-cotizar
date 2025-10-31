const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(protect);

// Rutas CRUD de clientes
router.get('/', clientesController.getClientes);
router.get('/:id', clientesController.getCliente);
router.post('/', clientesController.createCliente);
router.put('/:id', clientesController.updateCliente);

// Solo admin puede eliminar clientes
router.delete('/:id', authorize('admin'), clientesController.deleteCliente);

module.exports = router;
