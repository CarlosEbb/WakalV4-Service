// clienteController.js

import Cliente from '../models/cliente.js';
import {createJSONResponse} from '../utils/responseUtils.js';


// Controlador para obtener todos los clientes
export const getAllClientes = async (req, res) => {
    try {
        const clientes = await Cliente.getAll();
        // Convertir los valores BigInt a cadenas de texto
        const serializedClientes = clientes.map(cliente => ({
            ...cliente,
            id: cliente.id.toString()
            // Si hay otros campos BigInt, conviértelos de manera similar
        }));
        const jsonResponse = createJSONResponse(200, 'Clientes encontrados', serializedClientes);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al obtener todos los clientes:', error);
        const jsonResponse = createJSONResponse(500, 'Error al obtener todos los clientes', {});
        return res.status(500).json(jsonResponse);
    }
};

// Método para obtener todos los clientes con estado de conexión
export const getAllClientesWithConnectionStatus = async (req, res) => {
    try {
        const clientes = await Cliente.getAllWithConnectionStatus();
        const jsonResponse = createJSONResponse(200, 'Clientes con estado de conexión obtenidos correctamente', clientes);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al obtener clientes con estado de conexión:', error);
        const jsonResponse = createJSONResponse(500, 'Error interno del servidor al obtener clientes con estado de conexión', {});
        return res.status(500).json(jsonResponse);
    }
};

// Controlador para crear un nuevo cliente
export const createCliente = async (req, res) => {
    try {
        const { rif, nombre_cliente, connections, logo } = req.body;
        const newClienteId = await Cliente.create({ rif, nombre_cliente, connections, logo });
        const jsonResponse = createJSONResponse(201, 'Cliente creado correctamente', { clienteId: newClienteId });
        return res.status(201).json(jsonResponse);
    } catch (error) {
        console.error('Error al crear un nuevo cliente:', error);
        const jsonResponse = createJSONResponse(500, 'Error interno del servidor', {});
        return res.status(500).json(jsonResponse);
    }
};

// Controlador para obtener un cliente por su ID
export const getClienteById = async (req, res) => {
    try {
        const clienteId = req.params.id;
        const cliente = await Cliente.findById(clienteId);
        if (cliente) {
            // Convertir los valores BigInt a cadenas de texto
            const serializedCliente = {
                ...cliente,
                id: cliente.id.toString()
                // Si hay otros campos BigInt, conviértelos de manera similar
            };
            const jsonResponse = createJSONResponse(200, 'Cliente encontrado', serializedCliente);
            return res.status(200).json(jsonResponse);
        } else {
            const jsonResponse = createJSONResponse(404, 'Cliente no encontrado', {});
            return res.status(404).json(jsonResponse);
        }
    } catch (error) {
        console.error('Error al obtener el cliente por ID:', error);
        const jsonResponse = createJSONResponse(500, 'Error interno del servidor', {});
        return res.status(500).json(jsonResponse);
    }
};

// Controlador para actualizar un cliente por su ID
export const updateCliente = async (req, res) => {
    try {
        const clienteId = req.params.id;
        const fieldsToUpdate = req.body; // Obtener los campos a actualizar del cuerpo de la solicitud
        await Cliente.updateFields(clienteId, fieldsToUpdate); // Utilizar el método updateFields del modelo
        const jsonResponse = createJSONResponse(200, 'Cliente actualizado correctamente', {});
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al actualizar el cliente:', error);
        const jsonResponse = createJSONResponse(500, 'Error interno del servidor', {});
        return res.status(500).json(jsonResponse);
    }
};


// Controlador para eliminar un cliente por su ID
export const deleteCliente = async (req, res) => {
    try {
        const clienteId = req.params.id;
        await Cliente.delete(clienteId);
        const jsonResponse = createJSONResponse(200, 'Cliente eliminado correctamente', {});
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al eliminar el cliente:', error);
        const jsonResponse = createJSONResponse(500, 'Error interno del servidor', {});
        return res.status(500).json(jsonResponse);
    }
};