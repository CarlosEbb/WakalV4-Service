// auditMiddleware.js
import { insertAuditoria } from '../utils/auditUtils.js';

export default function auditMiddleware(req, res, next) {
    const ipClientValue = req.headers.ipclient || '';

    // Registra la auditoría de la solicitud, convirtiendo el objeto a JSON
    insertAuditoria(req.user.id, req.user.rol_id, req.originalUrl, req.method, JSON.stringify(req.body), ipClientValue);

    next(); // Continúa con la solicitud
}
