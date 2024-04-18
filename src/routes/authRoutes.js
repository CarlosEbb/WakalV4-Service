//authRoutes.js
import express from 'express';
const router = express.Router();
import {login, logout, resetPasswordRequest, changePassword, tokenVerify} from '../controllers/authController.js';

// Ruta para iniciar sesión
router.post('/login', login);

// Ruta para cerrar sesión
router.post('/logout', logout);

// Ruta para solicitar recuperación de contraseña
router.post('/reset-password-request', resetPasswordRequest);

// Ruta para cambiar la contraseña
router.post('/change-password', changePassword);

router.post('/token-verify', tokenVerify);

export default router;
