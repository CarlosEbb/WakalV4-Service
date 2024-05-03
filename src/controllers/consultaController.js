import Consulta from '../models/Consulta.js';
import ConsultaParametros from '../models/ConsultaParametros.js';
import { createJSONResponse } from '../utils/responseUtils.js';

// Controlador para obtener todas las consultas de un cliente
export const getAllConsultasByCliente = async (req, res) => {
    try {
        // Obtener el ID del cliente desde la solicitud
        const clienteId = req.params.clienteId;
        // Obtener todas las consultas del cliente
        const consultas = await Consulta.findByClienteId(clienteId);

        // Verificar si se encontraron consultas
        if (consultas.length === 0) {
            const jsonResponse = createJSONResponse(404, 'Consultas', { errors: ['No se encontraron consultas para este cliente'] });
            return res.status(404).json(jsonResponse);
        }

        //Iterar sobre las consultas y obtener los parámetros asociados a cada una
        for (const consulta of consultas) {
            consulta.parametros = await ConsultaParametros.findByTipoConsultaId(consulta.id);
        }

        // Retornar las consultas con sus parámetros en el response
        const jsonResponse = createJSONResponse(200, 'Consultas obtenidas correctamente', consultas);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al obtener las consultas del cliente:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
};
