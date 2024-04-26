//userController.js

import User from '../models/user.js';
import Cliente from '../models/cliente.js';
import UserCliente from '../models/userCliente.js';
import { createJSONResponse } from '../utils/responseUtils.js';
import { limpiarObjeto, saveImage, deleteImage } from '../utils/tools.js';
import Joi from 'joi';
import fs from 'fs';


// Metodo para obtener todos los usuarios
export const getAllUsers = async (req, res) => {
    try {
        const rol_id = req.user.rol_id;
        let users = [];
        if(rol_id === 1){
            users = await User.getAll();
        }else{
            users = await User.getAll(req.user);
        }
        const jsonResponse = createJSONResponse(200, 'Usuarios obtenidos correctamente', users);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al obtener todos los usuarios:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
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
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
};


// Definir el esquema de validación con Joi
const createUserSchema = Joi.object({
    email: Joi.string().email().max(150).required(),
   
    password: Joi.string().min(6).max(15).required(),
    rol_id: Joi.number().integer(),
    nombre: Joi.string().max(150).required(),
    apellido: Joi.string().max(150).required(),
    prefijo_cedula: Joi.string().max(5).required(),
    cedula: Joi.string().max(100).required(),
    access_expiration: Joi.date().allow(null),
    email_alternativo: Joi.string().email().max(150).required(),
    telefono: Joi.string().min(7).max(7).required(),
    department: Joi.string(),
    jurisdiccion_estado: Joi.string(),
    jurisdiccion_region: Joi.string(),
    jurisdiccion_sector: Joi.string(),
    cargo: Joi.string(),
    cod_area: Joi.string().min(4).max(4),
    username: Joi.string().required(),
    img_profile_file: Joi.any().meta({ swaggerType: 'file' }).optional().description('Imagen de perfil'),
}).unknown();

// Motodo para crear un nuevo usuario
export const createUsuario = async (req, res) => {
    const imagen = req.file;
    delete req.body.img_profile_file;
    try {
        // Validar los datos de entrada con Joi
        const { error, value } = createUserSchema.validate(req.body, { abortEarly: false });
        if (error) {
            const validationErrors = error.details.map(detail => detail.message.replace(/['"]/g, ''));
            const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: validationErrors });
            req.body.img_profile = imagen ? deleteImage(imagen) : null;
            return res.status(400).json(jsonResponse);
        }

        const { email, password, rol_id, nombre, apellido, prefijo_cedula, cedula, access_expiration } = req.body;
        const registered_by_user_id = req.user.id; // Obtener el ID del usuario que inició sesión desde el token

        // Verificar si el correo electrónico ya está registrado y si el usuario está eliminado lógicamente
        const existingUser = await User.emailExists(email);

        if (existingUser.exists) {
            if (existingUser.deleted) {
                // Actualizar el usuario existente con los nuevos datos
                req.body.enabled = 1;
                req.body.img_profile = imagen ? saveImage(imagen) : null;
                await User.updateFields(existingUser.userId, req.body);
                const jsonResponse = createJSONResponse(200, 'Usuario creado correctamente', { userId: existingUser.id });
                return res.status(200).json(jsonResponse);
            } else {
                const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: ['El correo electrónico ya está registrado'] });
                req.body.img_profile = imagen ? deleteImage(imagen) : null;
                return res.status(400).json(jsonResponse);
            }
        }

        if(req.user.rol_id !== 1){
            req.body.registered_by_user_id = registered_by_user_id;
            req.body.rol_id = req.user.rol_id;
        }

       
        // Si el correo electrónico no está registrado, proceder con la creación del usuario
        
        
        req.body.img_profile = imagen ? saveImage(imagen) : null;
        
        const newUserId = await User.create(req.body);

        
        if(req.user.rol_id == 1){
            if(req.body.rol_id == 3){//si el usuario que registras es tipo cliente
                if(req.body.cliente_id !== undefined && req.body.cliente_id !== null && req.body.cliente_id !== "") {//cliente nuevo
                    //vincular a cliente existente
                    await UserCliente.create({"user_id": newUserId, "cliente_id": req.body.cliente_id})
                }
            }
        }
        if(req.user.rol_id == 3){
            const userCliente = await User.findById(registered_by_user_id);
            console.log(userCliente);
            await UserCliente.create({"user_id": newUserId, "cliente_id": userCliente.cliente_id})
        }

        const jsonResponse = createJSONResponse(200, 'Usuario creado correctamente', { userId: newUserId });
        return res.status(201).json(jsonResponse);
    } catch (error) {
        console.error('Error al crear un nuevo usuario:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        req.body.img_profile = imagen ? deleteImage(imagen) : null;
        return res.status(500).json(jsonResponse);
    }
};


// Definir el esquema de validación con Joi
const updateUserSchema = Joi.object({
    email: Joi.string().email().max(150).required(),
    nombre: Joi.string().max(150).required(),
    apellido: Joi.string().max(150).required(),
    prefijo_cedula: Joi.string().max(5).required(),
    cedula: Joi.string().max(100).required(),
    access_expiration: Joi.date().allow(null),
    email_alternativo: Joi.string().email().max(150).required(),
    telefono: Joi.string().min(7).max(7).required(),
    department: Joi.string(),
    jurisdiccion_estado: Joi.string(),
    jurisdiccion_region: Joi.string(),
    jurisdiccion_sector: Joi.string(),
    cargo: Joi.string(),
    cod_area: Joi.string().min(4).max(4),
    username: Joi.string().required(),
}).unknown();



// Metodo para actualizar un usuario por su ID
export const updateUser = async (req, res) => {
    const imagen = req.file;
    try {
        const userId = req.params.id;
        const fieldsToUpdate = req.body;

        // Validar los campos recibidos en la solicitud
        const { error } = updateUserSchema.validate(fieldsToUpdate, { abortEarly: false });
        if (error) {
            const validationErrors = error.details.map(detail => detail.message.replace(/['"]/g, ''));
            const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: validationErrors });
            fieldsToUpdate.img_profile = imagen ? deleteImage(imagen) : null;
            return res.status(400).json(jsonResponse);
        }

        // Verificar si el correo electrónico está siendo actualizado y si es así, si pertenece al usuario que se está actualizando
        if ('email' in fieldsToUpdate) {
            const userEmail = fieldsToUpdate.email;
            const existingUser = await User.findByEmailOrUsername(userEmail);
            if (existingUser) {
                if (existingUser.id != userId) {
                    // El correo electrónico pertenece a otro usuario, no se puede actualizar
                    const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: ['El correo electrónico ya está en uso por otro usuario'] });
                    fieldsToUpdate.img_profile = imagen ? deleteImage(imagen) : null;
                    return res.status(400).json(jsonResponse);
                }
            }
        }

        // Si pasa todas las validaciones, actualizar el usuario
        fieldsToUpdate.img_profile = imagen ? saveImage(imagen) : null;
        await User.updateFields(userId, limpiarObjeto(fieldsToUpdate));
        const jsonResponse = createJSONResponse(200, 'Usuario actualizado correctamente', {});
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
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
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
};