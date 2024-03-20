//userController.js

const User = require('../models/user');
const responseUtils = require('../utils/responseUtils');

// Metodo para obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        const jsonResponse = responseUtils.createJSONResponse(200, 'Usuarios obtenidos correctamente', users);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al obtener todos los usuarios:', error);
        const jsonResponse = responseUtils.createJSONResponse(500, 'Error interno del servidor', {});
        return res.status(500).json(jsonResponse);
    }
};

// Metodo para obtener un usuario por su ID
exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (user) {
            const jsonResponse = responseUtils.createJSONResponse(200, 'Usuario obtenido correctamente', user);
            return res.status(200).json(jsonResponse);
        } else {
            const jsonResponse = responseUtils.createJSONResponse(404, 'Usuario no encontrado', {});
            return res.status(404).json(jsonResponse);
        }
    } catch (error) {
        console.error('Error al obtener el usuario por ID:', error);
        const jsonResponse = responseUtils.createJSONResponse(500, 'Error interno del servidor', {});
        return res.status(500).json(jsonResponse);
    }
};

// Controlador para crear un nuevo usuario
exports.createUsuario = async (req, res) => {
    try {
        const { email, password, rol_id, nombre, apellido, prefijo_cedula, cedula, access_expiration } = req.body;
        const newUserId = await User.create({ email, password, rol_id, nombre, apellido, prefijo_cedula, cedula, access_expiration });
        const jsonResponse = responseUtils.createJSONResponse(201, 'Usuario creado correctamente', { userId: newUserId });
        return res.status(201).json(jsonResponse);
    } catch (error) {
        console.error('Error al crear un nuevo usuario:', error);
        const jsonResponse = responseUtils.createJSONResponse(500, 'Error interno del servidor', {});
        return res.status(500).json(jsonResponse);
    }
};

// Método para actualizar un usuario por su ID
exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const fieldsToUpdate = req.body;
        await User.updateFields(userId, fieldsToUpdate);
        const jsonResponse = responseUtils.createJSONResponse(200, 'Usuario actualizado correctamente', {});
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        const jsonResponse = responseUtils.createJSONResponse(500, 'Error interno del servidor', {});
        return res.status(500).json(jsonResponse);
    }
};

// Metodo para eliminar un usuario por su ID
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        await User.delete(userId);
        const jsonResponse = responseUtils.createJSONResponse(200, 'Usuario eliminado correctamente', {});
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        const jsonResponse = responseUtils.createJSONResponse(500, 'Error interno del servidor', {});
        return res.status(500).json(jsonResponse);
    }
};