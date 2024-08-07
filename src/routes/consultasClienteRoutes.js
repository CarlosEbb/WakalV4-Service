//userRoutes.js
import express from 'express';

const router = express.Router();

import {getTotalEmitidos, getTotalMes, getTotalEmitidosSemanal, getDataBusqueda, getDataReporte, getDataReporteImprenta, getDataExcel, getDataPDF, generateDataPDFHTML, generateDataExcelHTML} from '../controllers/consultasClienteController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import checkRolePermissions from '../middlewares/checkRolePermissions.js';
import auditMiddleware from '../middlewares/auditMiddleware.js';

// Ruta para obtener todos los usuarios
router.get('/:cliente_id/getTotalEmitidos', authMiddleware, checkRolePermissions([1, 2, 3]), getTotalEmitidos);
router.get('/:cliente_id/getTotalMes/:year/:month', authMiddleware, checkRolePermissions([1, 2, 3]), getTotalMes);
router.get('/:cliente_id/getTotalEmitidosSemanal/:year/:month', authMiddleware, checkRolePermissions([1, 2, 3]), getTotalEmitidosSemanal);
//router.get('/:cliente_id/getTotalCorreos', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getTotalCorreos);
router.get('/:cliente_id/getDataBusqueda', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getDataBusqueda);
router.post('/:cliente_id/getDataReporte', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getDataReporte);
router.post('/:cliente_id/getDataReporteImprenta', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, getDataReporteImprenta);

router.post('/:cliente_id/generateDataPDFHTML', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, generateDataPDFHTML);
router.post('/:cliente_id/generateDataExcelHTML', authMiddleware, checkRolePermissions([1, 2, 3]), auditMiddleware, generateDataExcelHTML);


router.get('/:cliente_id/getDataPDF', getDataPDF);
router.get('/:cliente_id/getDataExcel', getDataExcel);

export default router;