//checkRolePermissions.js
import { createJSONResponse } from '../utils/responseUtils.js';
// Middleware para verificar el rol del usuario
export default function checkRolePermissions(allowedRoles) {
    return function(req, res, next) {
        // Verificar el rol del usuario extraído del token JWT
        const userRole = req.user.rol_id; // Suponiendo que el rol del usuario está almacenado en req.user.rolId

        // Verificar si el usuario tiene uno de los roles permitidos
        if (allowedRoles.includes(userRole)) {
            next(); // Permitir que la solicitud continúe hacia el controlador de la ruta
        } else {
            // Si el usuario no tiene uno de los roles permitidos, devolver un error de acceso no autorizado
            console.error('Error checkRolePermissions: ', "Acceso no autorizado");
            const jsonResponse = createJSONResponse(403, 'Servidor', { errors: ['Acceso no autorizado'] });
            return res.status(403).json(jsonResponse);
        }
    };
}
