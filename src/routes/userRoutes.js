//userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRolePermissions = require('../middlewares/checkRolePermissions');

// Ruta para obtener todos los usuarios
router.get('/', authMiddleware, checkRolePermissions([1, 2]), userController.getAllUsers);

// Ruta para crear un nuevo usuario
router.post('/', authMiddleware, checkRolePermissions([1]), userController.createUsuario);


// Ruta para obtener un usuario por su ID
router.get('/:id', authMiddleware, checkRolePermissions([1, 2]), userController.getUserById);

// Ruta para actualizar un usuario por su ID
router.put('/:id', authMiddleware, checkRolePermissions([1, 2]), userController.updateUser);

// Ruta para eliminar un usuario por su ID
router.delete('/:id', authMiddleware, checkRolePermissions([1, 2]), userController.deleteUser);


module.exports = router;
