//userRoutes.js
import express from 'express';

const router = express.Router();

import {getAllAuditorias} from '../controllers/auditoriaController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import checkRolePermissions from '../middlewares/checkRolePermissions.js';
import auditMiddleware from '../middlewares/auditMiddleware.js';

// Ruta para obtener todos los usuarios
router.get('/', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getAllAuditorias);

export default router;
