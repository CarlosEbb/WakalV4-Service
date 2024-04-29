//userRoutes.js
import express from 'express';
const router = express.Router();
import {getTotalEmitidos, getTotalMes, getTotalCorreos} from '../controllers/consultasClienteController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import checkRolePermissions from '../middlewares/checkRolePermissions.js';
import auditMiddleware from '../middlewares/auditMiddleware.js';

// Ruta para obtener todos los usuarios
router.get('/:cliente_id/getTotalEmitidos', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getTotalEmitidos);
router.get('/:cliente_id/getTotalMes/:year/:month', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getTotalMes);
router.get('/:cliente_id/getTotalCorreos', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getTotalCorreos);

export default router;