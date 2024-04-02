// consultaRoutes.js
import express from 'express';
const router = express.Router();
import { getAllConsultasByCliente } from '../controllers/consultaController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import checkRolePermissions from '../middlewares/checkRolePermissions.js';


// Ruta para obtener todas las consultas de un cliente
router.get('/cliente/:clienteId', authMiddleware, checkRolePermissions([1, 2]), getAllConsultasByCliente);


export default router;