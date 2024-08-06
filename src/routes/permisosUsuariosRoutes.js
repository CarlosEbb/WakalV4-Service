//userRoutes.js
import express from 'express';

const router = express.Router();

import {getAllPermisosByUsuario, CheckPermissionAndUser} from '../controllers/permisosUsuariosController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import checkRolePermissions from '../middlewares/checkRolePermissions.js';
import auditMiddleware from '../middlewares/auditMiddleware.js'
import checkPermissionsUser from '../middlewares/checkPermissionsUser.js'

// Ruta para obtener todos los permisos
router.get('/:user_id', getAllPermisosByUsuario);
router.post('/check', checkPermissionsUser([1, 2, 3]), CheckPermissionAndUser)

export default router;
