//userRoutes.js
import express from 'express';
const router = express.Router();
import {getAllRoles} from '../controllers/rolController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import checkRolePermissions from '../middlewares/checkRolePermissions.js';

// Ruta para obtener todos los usuarios
router.get('/', authMiddleware, checkRolePermissions([1, 2]), getAllRoles);

export default router;
