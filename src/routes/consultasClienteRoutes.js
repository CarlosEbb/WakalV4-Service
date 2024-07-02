//userRoutes.js
import express from 'express';

const router = express.Router();

import {getTotalEmitidos, getTotalMes, getTotalEmitidosSemanal, getDataBusqueda, getDataExcel, getDataPDF, generateDataPDFHTML, generateDataExcelHTML} from '../controllers/consultasClienteController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import checkRolePermissions from '../middlewares/checkRolePermissions.js';
import auditMiddleware from '../middlewares/auditMiddleware.js';

// Ruta para obtener todos los usuarios
router.get('/:cliente_id/getTotalEmitidos', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getTotalEmitidos);
router.get('/:cliente_id/getTotalMes/:year/:month', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getTotalMes);
router.get('/:cliente_id/getTotalEmitidosSemanal/:year/:month', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getTotalEmitidosSemanal);
//router.get('/:cliente_id/getTotalCorreos', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getTotalCorreos);
router.get('/:cliente_id/getDataBusqueda', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getDataBusqueda);

router.post('/:cliente_id/generateDataPDFHTML', generateDataPDFHTML);
router.post('/:cliente_id/generateDataExcelHTML', generateDataExcelHTML);


router.get('/:cliente_id/getDataPDF', getDataPDF);
router.get('/:cliente_id/getDataExcel', getDataExcel);

export default router;