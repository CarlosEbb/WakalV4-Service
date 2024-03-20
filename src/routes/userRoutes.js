//userRoutes.js
import express from 'express';
const router = express.Router();
import {getAllUsers, createUsuario, getUserById, updateUser, deleteUser} from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import checkRolePermissions from '../middlewares/checkRolePermissions.js';

// Ruta para obtener todos los usuarios
router.get('/', authMiddleware, checkRolePermissions([1, 2]), getAllUsers);

// Ruta para crear un nuevo usuario
router.post('/', authMiddleware, checkRolePermissions([1]), createUsuario);


// Ruta para obtener un usuario por su ID
router.get('/:id', authMiddleware, checkRolePermissions([1, 2]), getUserById);

// Ruta para actualizar un usuario por su ID
router.put('/:id', authMiddleware, checkRolePermissions([1, 2]), updateUser);

// Ruta para eliminar un usuario por su ID
router.delete('/:id', authMiddleware, checkRolePermissions([1, 2]), deleteUser);


export default router;
