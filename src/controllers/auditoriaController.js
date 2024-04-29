import Auditoria from '../models/auditoria.js';
import { createJSONResponse } from '../utils/responseUtils.js';

// Método para obtener todas las auditorias
export const getAllAuditorias = async (req, res) => {
    try {
        const rol_id = req.user.rol_id;
        let auditorias = [];
        if (rol_id === 1) {
            auditorias = await Auditoria.getAll();
        } else {
            auditorias = await Auditoria.getAll(req.user);
        }
        const jsonResponse = createJSONResponse(200, 'Auditorias obtenidas correctamente', auditorias);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al obtener todas las auditorias:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
};
