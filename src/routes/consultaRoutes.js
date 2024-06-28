// consultaRoutes.js
import express from 'express';

const router = express.Router();

import { getAllConsultasByCliente, getConsultasPDF, getAllParametros, createConsultas, deleteConsultas, getAllConsultasByClienteAndRol } from '../controllers/consultaController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import checkRolePermissions from '../middlewares/checkRolePermissions.js';
import auditMiddleware from '../middlewares/auditMiddleware.js';

// Ruta para obtener todas las consultas de un cliente
router.get('/cliente/:clienteId', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getAllConsultasByCliente);
router.get('/cliente/:clienteId/:rolId', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getAllConsultasByClienteAndRol);
router.get('/clientes/parametros', authMiddleware, checkRolePermissions([1]), auditMiddleware, getAllParametros);
router.get('/cliente/:cliente_id/getpdf/:numero_control/:tipo_documento/:numero_documento/:mes/:encrypt', getConsultasPDF);

// Ruta para crear consultas de busqueda
router.post('/cliente/:cliente_id', authMiddleware, checkRolePermissions([1]), auditMiddleware, createConsultas);

// Ruta para eliminar un usuario por su ID
router.delete('/:id', authMiddleware, checkRolePermissions([1]), auditMiddleware, deleteConsultas);

export default router;