// clienteController.js

import Cliente from '../models/cliente.js';
import { createJSONResponse } from '../utils/responseUtils.js';
import { limpiarObjeto, saveImage, deleteImage } from '../utils/tools.js';
import Joi from 'joi';

// Controlador para obtener todos los clientes
export const getAllClientes = async (req, res) => {
    try {
        const clientes = await Cliente.getAll();

        const jsonResponse = createJSONResponse(200, 'Clientes encontrados', clientes);
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

// Definir el esquema de validación con Joi para la creación de clientes
export const createClienteSchema = Joi.object({
    rif: Joi.string().max(20).required(),
    nombre_cliente: Joi.string().max(50).required(),
    connections: Joi.string().max(255).allow(null),
    logo: Joi.string().max(255).allow(null),
}).unknown();

// Controlador para crear un nuevo cliente
export const createCliente = async (req, res) => {
    const imagen = req.file;
    delete req.body.logo;
    try {
        // Validar los datos de entrada con Joi
        const { error, value } = createClienteSchema.validate(req.body, { abortEarly: false });
        if (error) {
            const validationErrors = error.details.map(detail => detail.message.replace(/['"]/g, ''));
            const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: validationErrors });
            req.body.logo = imagen ? deleteImage(imagen) : null;
            return res.status(400).json(jsonResponse);
        }

        // Verificar si el RIF ya existe y si está eliminado lógicamente
        const { rif, nombre_cliente, connections, logo } = req.body;
        const existingClient = await Cliente.rifExists(rif);
        if (existingClient.exists) {
            if (existingClient.deleted) {
                // Actualizar el cliente existente con los nuevos datos
                req.body.enabled = 1;
                req.body.logo = imagen ? saveImage(imagen) : null;
                await Cliente.updateFields(existingClient.clientId, req.body);
                const jsonResponse = createJSONResponse(200, 'Cliente actualizado correctamente', { clienteId: existingClient.clientId });
                return res.status(200).json(jsonResponse);
            } else {
                const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: ['El RIF ya está registrado'] });
                req.body.logo = imagen ? deleteImage(imagen) : null;
                return res.status(400).json(jsonResponse);
            }
        }

        // Si el RIF no está registrado o está eliminado, proceder con la creación del cliente
        req.body.logo = imagen ? saveImage(imagen) : null;
        const newClienteId = await Cliente.create(req.body);
        const jsonResponse = createJSONResponse(201, 'Cliente creado correctamente', { clienteId: newClienteId });
        return res.status(201).json(jsonResponse);
    } catch (error) {
        console.error('Error al crear un nuevo cliente:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        req.body.logo = imagen ? deleteImage(imagen) : null;
        return res.status(500).json(jsonResponse);
    }
};

// Controlador para obtener un cliente por su ID
export const getClienteById = async (req, res) => {
    try {
        const clienteId = req.params.id;
        const cliente = await Cliente.findById(clienteId);
        if (cliente) {
            const jsonResponse = createJSONResponse(200, 'Cliente encontrado', cliente);
            return res.status(200).json(jsonResponse);
        } else {
            const jsonResponse = createJSONResponse(404, 'Cliente no encontrado', {});
            return res.status(404).json(jsonResponse);
        }
    } catch (error) {
        console.error('Error al obtener el cliente por ID:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
};

// Definir el esquema de validación con Joi para la actualizacion de clientes
export const updateClienteSchema = Joi.object({
    rif: Joi.string().min(2).max(20),
    nombre_cliente: Joi.string().min(2).max(50),
    connections: Joi.string().min(2).max(255).allow(null),
    logo: Joi.string().min(2).max(255).allow(null),
}).unknown();

// Controlador para actualizar un cliente por su ID
export const updateCliente = async (req, res) => {
    const imagen = req.file;
    try {
        const clienteId = req.params.id;
        const fieldsToUpdate = req.body;

        // Validar que no se envíe un objeto vacío en el cuerpo de la solicitud
        if (Object.keys(fieldsToUpdate).length === 0) {
            const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: ['El cuerpo de la solicitud no puede estar vacío'] });
            fieldsToUpdate.logo = imagen ? deleteImage(imagen) : null;
            return res.status(400).json(jsonResponse);
        }

        // Validar los datos de entrada con Joi
        const { error } = updateClienteSchema.validate(fieldsToUpdate, { abortEarly: false });
        if (error) {
            const validationErrors = error.details.map(detail => detail.message.replace(/['"]/g, ''));
            const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: validationErrors });
            fieldsToUpdate.logo = imagen ? deleteImage(imagen) : null;
            return res.status(400).json(jsonResponse);
        }

        // Verificar si el RIF está siendo actualizado y si pertenece al cliente que se está actualizando
        if ('rif' in fieldsToUpdate) {
            const clientRif = fieldsToUpdate.rif;
            const existingClient = await Cliente.findByRif(clientRif);
            if (existingClient) {
                if (existingClient.id != clienteId) {
                    // El RIF pertenece a otro cliente, no se puede actualizar
                    const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: ['El RIF pertenece a otro cliente'] });
                    fieldsToUpdate.logo = imagen ? deleteImage(imagen) : null;
                    return res.status(400).json(jsonResponse);
                }
            }
        }

        // Si pasa todas las validaciones, actualizar el cliente
        fieldsToUpdate.logo = imagen ? saveImage(imagen) : null;
        //console.log('aquiii', limpiarObjeto(fieldsToUpdate))
        await Cliente.updateFields(clienteId, limpiarObjeto(fieldsToUpdate));
        const jsonResponse = createJSONResponse(200, 'Cliente actualizado correctamente', {});
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al actualizar el cliente:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        fieldsToUpdate.logo = imagen ? deleteImage(imagen) : null;
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
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
};