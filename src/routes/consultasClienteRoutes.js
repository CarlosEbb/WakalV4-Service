//userRoutes.js
import express from 'express';
const router = express.Router();
import {getTotalEmitidos, getTotalMes, getTotalEmitidosSemanal, getDataBusqueda, getDataPDF} from '../controllers/consultasClienteController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import checkRolePermissions from '../middlewares/checkRolePermissions.js';
import auditMiddleware from '../middlewares/auditMiddleware.js';

// Ruta para obtener todos los usuarios
router.get('/:cliente_id/getTotalEmitidos', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getTotalEmitidos);
router.get('/:cliente_id/getTotalMes/:year/:month', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getTotalMes);
router.get('/:cliente_id/getTotalEmitidosSemanal/:year/:month', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getTotalEmitidosSemanal);
//router.get('/:cliente_id/getTotalCorreos', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getTotalCorreos);
router.get('/:cliente_id/getDataBusqueda', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getDataBusqueda);
router.post('/:cliente_id/getDataPDF', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getDataPDF);

export default router;