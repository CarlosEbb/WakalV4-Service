// clienteRoutes.js

import express from 'express';
import multer from 'multer';
const router = express.Router();
import {getAllClientesWithConnectionStatus, getAllClientes, createCliente, getClienteById, updateCliente, deleteCliente} from '../controllers/clienteController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import checkRolePermissions from '../middlewares/checkRolePermissions.js';
import auditMiddleware from '../middlewares/auditMiddleware.js';

// Configura multer para almacenar archivos
const upload = multer({ dest: './uploads/logo_clientes/' });

// Ruta para obtener todos los clientes con estado de conexión
router.get('/with-connection-status', authMiddleware, checkRolePermissions([1]), auditMiddleware, getAllClientesWithConnectionStatus);

// Ruta para obtener todos los clientes
router.get('/', authMiddleware, checkRolePermissions([1, 2]), auditMiddleware, getAllClientes);

// Ruta para crear un nuevo cliente
router.post('/', authMiddleware, checkRolePermissions([1]), upload.single('logo'), auditMiddleware, createCliente);

// Ruta para obtener un cliente por su ID
router.get('/:id', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getClienteById);

// Ruta para actualizar un cliente por su ID
router.put('/:id', authMiddleware, checkRolePermissions([1]), upload.single('logo'), auditMiddleware, updateCliente);

// Ruta para eliminar un cliente por su ID
router.delete('/:id', authMiddleware, checkRolePermissions([1]), auditMiddleware, deleteCliente);


export default router;
