//userRoutes.js
import express from 'express';

const router = express.Router();

import {getAllPermisos} from '../controllers/permisosController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import checkRolePermissions from '../middlewares/checkRolePermissions.js';
import auditMiddleware from '../middlewares/auditMiddleware.js';

// Ruta para obtener todos los permisos
router.get('/', getAllPermisos);

export default router;
