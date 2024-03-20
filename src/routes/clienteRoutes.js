// clienteRoutes.js

const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRolePermissions = require('../middlewares/checkRolePermissions');


// Ruta para obtener todos los clientes con estado de conexión
router.get('/with-connection-status', authMiddleware, checkRolePermissions([1]), clienteController.getAllClientesWithConnectionStatus);

// Ruta para obtener todos los clientes
router.get('/', authMiddleware, checkRolePermissions([1, 2]), clienteController.getAllClientes);

// Ruta para crear un nuevo cliente
router.post('/', authMiddleware, checkRolePermissions([1]), clienteController.createCliente);

// Ruta para obtener un cliente por su ID
router.get('/:id', authMiddleware, checkRolePermissions([1, 2]), clienteController.getClienteById);

// Ruta para actualizar un cliente por su ID
router.put('/:id', authMiddleware, checkRolePermissions([1]), clienteController.updateCliente);

// Ruta para eliminar un cliente por su ID
router.delete('/:id', authMiddleware, checkRolePermissions([1]), clienteController.deleteCliente);


module.exports = router;
