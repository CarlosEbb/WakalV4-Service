//userController.js

import User from '../models/user.js';
import {createJSONResponse} from '../utils/responseUtils.js';

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

// Controlador para crear un nuevo usuario
export const createUsuario = async (req, res) => {
    try {
        const { email, password, rol_id, nombre, apellido, prefijo_cedula, cedula, access_expiration } = req.body;
        const newUserId = await User.create({ email, password, rol_id, nombre, apellido, prefijo_cedula, cedula, access_expiration });
        const jsonResponse = createJSONResponse(201, 'Usuario creado correctamente', { userId: newUserId });
        return res.status(201).json(jsonResponse);
    } catch (error) {
        console.error('Error al crear un nuevo usuario:', error);
        const jsonResponse = createJSONResponse(500, 'Error interno del servidor', {});
        return res.status(500).json(jsonResponse);
    }
};

// Método para actualizar un usuario por su ID
export const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const fieldsToUpdate = req.body;
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