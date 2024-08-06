import PermisosUsuarios from '../models/permisosUsuarios.js';
import { createJSONResponse } from '../utils/responseUtils.js';

// Método para obtener todos los Permisos de un usuario
export const getAllPermisosByUsuario = async (req, res) => {
    try {
        let permisosUsuarios = [];
        permisosUsuarios = await PermisosUsuarios.getAllByUsuario(req.params.user_id);
        const jsonResponse = createJSONResponse(200, 'Permisos Usuario obtenidos correctamente', permisosUsuarios);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al obtener todos los permisos usuario:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
};

export const CheckPermissionAndUser = async (req, res) => {
    try {
        let permisosUsuarios = [];
        permisosUsuarios = await PermisosUsuarios.checkPermissionAndUser(req.body.permission);
        const jsonResponse = createJSONResponse(200, 'Permiso Usuario obtenido correctamente', permisosUsuarios);
        if (jsonResponse.data.length > 0) {
            return res.status(200).json(jsonResponse);            
        } else {
            return res.status(204).json(jsonResponse);            
        } 
    } catch (error) {
        console.error('Error al verificar el permiso de un usuario');
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
} 