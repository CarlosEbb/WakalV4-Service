//userRoutes.js
import express from 'express';
import csrf from 'csurf';
import multer from 'multer';
const router = express.Router();
const csrfProtection = csrf({ cookie: true });
import {getAllUsers, createUsuario, getUserById, updateUser, deleteUser} from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import checkRolePermissions from '../middlewares/checkRolePermissions.js';
import auditMiddleware from '../middlewares/auditMiddleware.js';

// Configura multer para almacenar archivos
const upload = multer({ dest: './uploads/img_perfil/' });

// Ruta para obtener todos los usuarios
router.get('/', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getAllUsers);

// Ruta para crear un nuevo usuario
router.post('/', authMiddleware, checkRolePermissions([1, 2, 3]), upload.single('img_profile_file'), auditMiddleware, createUsuario);

// Ruta para obtener un usuario por su ID
router.get('/:id', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getUserById);

// Ruta para actualizar un usuario por su ID
router.put('/:id', authMiddleware, checkRolePermissions([1, 2, 3]), upload.single('img_profile_file'), auditMiddleware, updateUser);

// Ruta para eliminar un usuario por su ID
router.delete('/:id', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, deleteUser);

export default router;
