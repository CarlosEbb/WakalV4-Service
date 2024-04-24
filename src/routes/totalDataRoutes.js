// consultaRoutes.js
import express from 'express';
const router = express.Router();
import { totalesSemanales } from '../controllers/totalDataController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import checkRolePermissions from '../middlewares/checkRolePermissions.js';
import auditMiddleware from '../middlewares/auditMiddleware.js';

// Importa la función getAllClientes del controlador clienteController
import { getAllClientes } from '../controllers/clienteController.js';

// Ruta para obtener todas las consultas de un cliente
router.get('/totalesSemanales/:id', authMiddleware, checkRolePermissions([1, 2]) , auditMiddleware, totalesSemanales);
router.get('/totalesSemanales', authMiddleware, checkRolePermissions([1, 2]) , auditMiddleware, totalesSemanales);

export default router;