import Role from '../models/rol.js';
import { createJSONResponse } from '../utils/responseUtils.js';

// Método para obtener todos los roles
export const getAllRoles = async (req, res) => {
    try {
        const rol_id = req.user.rol_id;
        let roles = [];
        if (rol_id === 1) {
            roles = await Role.getAll();
        } else {
            roles = await Role.getAll(req.user);
        }
        const jsonResponse = createJSONResponse(200, 'Roles obtenidos correctamente', roles);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al obtener todos los roles:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
};
