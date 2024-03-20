//authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta para iniciar sesión
router.post('/login', authController.login);

// Ruta para cerrar sesión
router.post('/logout', authController.logout);

// Ruta para solicitar recuperación de contraseña
router.post('/reset-password-request', authController.resetPasswordRequest);

// Ruta para cambiar la contraseña
router.post('/change-password', authController.changePassword);

module.exports = router;
