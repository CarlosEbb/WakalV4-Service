// consultaRoutes.js
import express from 'express';
const router = express.Router();
import { getAllConsultasByCliente, getConsultasPDF } from '../controllers/consultaController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import checkRolePermissions from '../middlewares/checkRolePermissions.js';
import auditMiddleware from '../middlewares/auditMiddleware.js';

// Ruta para obtener todas las consultas de un cliente
router.get('/cliente/:clienteId', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getAllConsultasByCliente);
router.get('/cliente/:cliente_id/getpdf/:numero_control/:tipo_documento/:numero_documento/:mes/:encrypt', getConsultasPDF);


export default router;