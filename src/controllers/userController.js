//userController.js

import User from '../models/user.js';
import {createJSONResponse} from '../utils/responseUtils.js';
import Joi from 'joi-es';

// Metodo para obtener todos los usuarios
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        const jsonResponse = createJSONResponse(200, 'Usuarios obtenidos correctamente', users);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al obtener todos los usuarios:', error);
        const jsonResponse = createJSONResponse(500, 'Error interno del servidor', {});
        return res.status(500).json(jsonResponse);
    }
};

// Metodo para obtener un usuario por su ID
export const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (user) {
            const jsonResponse = createJSONResponse(200, 'Usuario obtenido correctamente', user);
            return res.status(200).json(jsonResponse);
        } else {
            const jsonResponse = createJSONResponse(404, 'Usuario no encontrado', {});
            return res.status(404).json(jsonResponse);
        }
    } catch (error) {
        console.error('Error al obtener el usuario por ID:', error);
        const jsonResponse = createJSONResponse(500, 'Error interno del servidor', {});
        return res.status(500).json(jsonResponse);
    }
};


// Definir el esquema de validación con Joi
const createUserSchema = Joi.object({
    email: Joi.string().email().max(150).required(),
    password: Joi.string().min(6).max(15).required(),
    rol_id: Joi.number().integer().required(),
    nombre: Joi.string().max(150).required(),
    apellido: Joi.string().max(150).required(),
    prefijo_cedula: Joi.string().max(5).required(),
    cedula: Joi.string().max(100).required(),
    access_expiration: Joi.date().allow(null),
});

// Motodo para crear un nuevo usuario
export const createUsuario = async (req, res) => {
    try {
        // Validar los datos de entrada con Joi
        const { error, value } = createUserSchema.validate(req.body, { abortEarly: false });
        if (error) {
            const validationErrors = error.details.map(detail => detail.message.replace(/['"]/g, ''));
            const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: validationErrors });
            return res.status(400).json(jsonResponse);
        }

        const { email, password, rol_id, nombre, apellido, prefijo_cedula, cedula, access_expiration } = req.body;
        const registered_by_user_id = req.user.id; // Obtener el ID del usuario que inició sesión desde el token

        // Verificar si el correo electrónico ya está registrado y si el usuario está eliminado lógicamente
        const existingUser = await User.emailExists(email);

        if (existingUser.exists) {
            if (existingUser.deleted) {
                // Actualizar el usuario existente con los nuevos datos
                const enabled = 1;
                await User.updateFields(existingUser.userId, { email, password, rol_id, nombre, apellido, prefijo_cedula, cedula, access_expiration, enabled });
                const jsonResponse = createJSONResponse(200, 'Usuario creado correctamente', { userId: existingUser.id });
                return res.status(200).json(jsonResponse);
            } else {
                const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: ['El correo electrónico ya está registrado'] });
                return res.status(400).json(jsonResponse);
            }
        }

        // Si el correo electrónico no está registrado, proceder con la creación del usuario
        const newUserId = await User.create({ email, password, rol_id, nombre, apellido, prefijo_cedula, cedula, access_expiration, registered_by_user_id });

        const jsonResponse = createJSONResponse(201, 'Usuario creado correctamente', { userId: newUserId });
        return res.status(201).json(jsonResponse);
    } catch (error) {
        console.error('Error al crear un nuevo usuario:', error);
        const jsonResponse = createJSONResponse(500, 'Error interno del servidor', {});
        return res.status(500).json(jsonResponse);
    }
};


// Definir el esquema de validación con Joi
const updateUserSchema = Joi.object({
    email: Joi.string().email().max(150),
    password: Joi.string().min(6).max(15),
    rol_id: Joi.number().integer(),
    nombre: Joi.string().max(150),
    apellido: Joi.string().max(150),
    prefijo_cedula: Joi.string().max(5),
    cedula: Joi.string().max(100),
    access_expiration: Joi.date().allow(null),
});

// Metodo para actualizar un usuario por su ID
export const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const fieldsToUpdate = req.body;

        // Validar los campos recibidos en la solicitud
        const { error } = updateUserSchema.validate(fieldsToUpdate, { abortEarly: false });
        if (error) {
            const validationErrors = error.details.map(detail => detail.message.replace(/['"]/g, ''));
            const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: validationErrors });
            return res.status(400).json(jsonResponse);
        }

        // Verificar si el correo electrónico está siendo actualizado y si es así, si pertenece al usuario que se está actualizando
        if (fieldsToUpdate.hasOwnProperty('email')) {
            const userEmail = fieldsToUpdate.email;
            const existingUser = await User.findByEmail(userEmail);
            if (existingUser) {
                if (existingUser.id != userId) {
                    // El correo electrónico pertenece a otro usuario, no se puede actualizar
                    const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: ['El correo electrónico ya está en uso por otro usuario'] });
                    return res.status(400).json(jsonResponse);
                }
            }
        }

        // Si pasa todas las validaciones, actualizar el usuario
        await User.updateFields(userId, fieldsToUpdate);
        const jsonResponse = createJSONResponse(200, 'Usuario actualizado correctamente', {});
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        const jsonResponse = createJSONResponse(500, 'Error interno del servidor', {});
        return res.status(500).json(jsonResponse);
    }
};


// Metodo para eliminar un usuario por su ID
export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        await User.delete(userId);
        const jsonResponse = createJSONResponse(200, 'Usuario eliminado correctamente', {});
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        const jsonResponse = createJSONResponse(500, 'Error interno del servidor', {});
        return res.status(500).json(jsonResponse);
    }
};