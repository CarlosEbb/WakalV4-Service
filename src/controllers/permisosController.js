import Permisos from '../models/permisos.js';
import { createJSONResponse } from '../utils/responseUtils.js';

// Método para obtener todos los Permisos
export const getAllPermisos = async (req, res) => {
    try {
        let permisos = [];
        permisos = await Permisos.getAll();
        const jsonResponse = createJSONResponse(200, 'Permisos obtenidos correctamente', permisos);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al obtener todos los permisos:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
};
