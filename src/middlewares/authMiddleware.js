//authMiddleware.js
import jwt from 'jsonwebtoken';
import { createJSONResponse } from '../utils/responseUtils.js';
import { insertAuditoria } from '../utils/auditUtils.js';

export default function authMiddleware(req, res, next) {    
    // Obtener el token del encabezado de autorización
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        // Si no hay token, devolver un error de no autorizado
        const jsonResponse = createJSONResponse(401, 'No se proporcionó un token de acceso', {});
        return res.status(401).json(jsonResponse);
    }

    // Verificar el token
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
            // Si hay un error al verificar el token, devolver un error de no autorizado
            const jsonResponse = createJSONResponse(401, 'Token de acceso inválido', {});
            return res.status(401).json(jsonResponse);
        } else {
            // Si el token es válido, adjuntar la información del usuario al objeto de solicitud
            req.user = decodedToken;
            
            //insertAuditoria(req.user.id, req.user.rol_id, req.originalUrl, req.method, JSON.stringify(req.body), req.ip);

            next(); // Continuar con la solicitud
        }
    });
};
