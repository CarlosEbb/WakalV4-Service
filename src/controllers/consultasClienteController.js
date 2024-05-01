import Cliente from '../models/cliente.js';
import User from '../models/user.js';
import ConsultasCliente from '../models/consultasCliente.js';
import { createJSONResponse } from '../utils/responseUtils.js';

// Método para obtener todos los documentos emitidos desde origen
export const getTotalEmitidos = async (req, res) => {
    try {
        let cliente;
        const rol_id = req.user.rol_id;
        const cliente_id = req.params.cliente_id;
        if (rol_id === 1 || rol_id === 2) {
          cliente = await Cliente.findById(cliente_id);
        } else {
          const user = await User.findById(req.user.id);
          cliente = await Cliente.findById(user.cliente_id);          
        }

        const consulta = new ConsultasCliente(cliente);
        const totalEmitidos = await consulta.getTotalEmitidos();

        const jsonResponse = createJSONResponse(200, 'Totales emitidos obtenidos correctamente', totalEmitidos);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al obtener Totales Emitidos:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
};

//metodo para obtener el total de documentos emitidos en un mes en especifico
export const getTotalMes = async (req, res) => {
    try {

        let cliente;
        const rol_id = req.user.rol_id;
        const cliente_id = req.params.cliente_id;
        if (rol_id === 1 || rol_id === 2) {
          cliente = await Cliente.findById(cliente_id);
        } else {
          const user = await User.findById(req.user.id);
          cliente = await Cliente.findById(user.cliente_id);          
        }



        const consulta = new ConsultasCliente(cliente);
        const totalEmitidos = await consulta.getTotalMes(req.params.year, req.params.month);

        const jsonResponse = createJSONResponse(200, 'Totales emitidos por mes obtenidos correctamente', totalEmitidos);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al obtener Totales Emitidos:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
};

//metodo para obtener total emitidos por mes, separado por semanas
export const getTotalEmitidosSemanal = async (req, res) => {
    try {
        let cliente;
        const rol_id = req.user.rol_id;
        const cliente_id = req.params.cliente_id;
        if (rol_id === 1 || rol_id === 2) {
          cliente = await Cliente.findById(cliente_id);
        } else {
          const user = await User.findById(req.user.id);
          cliente = await Cliente.findById(user.cliente_id);          
        }

        const consulta = new ConsultasCliente(cliente);
        const totalEmitidosSemanal = await consulta.getTotalSemanal(req.params.year, req.params.month);

        const jsonResponse = createJSONResponse(200, 'Totales semanales emitidos obtenidos correctamente', totalEmitidosSemanal);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al obtener Totales Emitidos:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
};

// export const getTotalCorreos = async (req, res) => {
//     try {
       
//         const jsonResponse = createJSONResponse(200, 'Correos emitidos obtenidos correctamente', []);
//         return res.status(200).json(jsonResponse);
//     } catch (error) {
//         console.error('Error al obtener Totales Emitidos:', error);
//         const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
//         return res.status(500).json(jsonResponse);
//     }
// };


