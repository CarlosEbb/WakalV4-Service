import Auditoria from '../models/auditoria.js';
import { createJSONResponse } from '../utils/responseUtils.js';
import Cliente from '../models/cliente.js';
import User from '../models/user.js';

// Método para obtener todas las auditorias
export const getAllAuditorias = async (req, res) => {
    try {
        
        const { rol_id, id: user_id } = req.user;
        let auditorias = [];
        
        if (rol_id === 1) {
            auditorias = await Auditoria.getAll();
        }else if (rol_id === 2) {
            auditorias = await Auditoria.getAll({ rol_id });
        }else if (rol_id === 3) {
            const user = await User.findById(req.user.id);
            let cliente = await Cliente.findById(user.cliente_id);        
            //hay que hacer que vea los otros usuarios que son del mismo cliente
            const cliente_id = cliente.id; // Assuming cliente_id is passed in the request body
            auditorias = await Auditoria.getAll({ rol_id, user_id, cliente_id });
        }

        const jsonResponse = createJSONResponse(200, 'Auditorias obtenidas correctamente', auditorias);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al obtener todas las auditorias:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
};
