//checkPermissionsUser.js
import { createJSONResponse } from '../utils/responseUtils.js';
import PermisosUsuarios from '../models/permisosUsuarios.js'
// Middleware para verificar el Permiso del usuario
export default function checkPermissionsUser(allowedPermissionsUser) {
    return async function(req, res, next) {
        
        // Si el usuario no tiene permiso, devolver un error de acceso no autorizado
        if (!allowedPermissionsUser.includes(req.body.permission.permisos_id)) {
            const jsonResponse = createJSONResponse(403, 'Servidor', { errors: ['Acceso no autorizado'] });
            return res.status(403).json(jsonResponse);
        }

        // Validamos ese permiso en BD para ese usuario
        const permisosUsuarios = await PermisosUsuarios.checkPermissionAndUser(req.body.permission);
        const jsonResponse = createJSONResponse(200, 'Permiso Usuario obtenido', permisosUsuarios);
        
        if (jsonResponse.data.length > 0) {
            next(); // Permitir que la solicitud continúe hacia el controlador de la ruta
        } else {
            // Si el usuario no tiene permiso, devolver un error de acceso no autorizado
            console.error('Error checkPermissionUser: ', "Acceso no autorizado");
            const jsonResponse = createJSONResponse(403, 'Servidor', { errors: ['Acceso no autorizado'] });
            return res.status(403).json(jsonResponse);
        }
    };
}
