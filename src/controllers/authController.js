//authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

import User from '../models/user.js';

import {generateResetToken, isTokenInvalid, addToInvalidTokens} from '../utils/tokenUtils.js';
import {createJSONResponse} from '../utils/responseUtils.js';
import { insertAuditoria } from '../utils/auditUtils.js';
import { sendEmail } from '../utils/emailController.js';


//import * as dotenv from 'dotenv' dotenv.config();
//require('dotenv').config();

export const login = async (req, res) => {
    try {
        if (!req.body || !req.body.email || !req.body.password) {
            const jsonResponse = createJSONResponse(400, 'Solicitud incorrecta: El cuerpo de la solicitud debe contener email y password', {});
            return res.status(400).json(jsonResponse);
        }

        const { email, password } = req.body;

        // Buscar el usuario por su correo electrónico
        const user = await User.findByEmail(email);

        // Verificar si se encontró un usuario y si la contraseña coincide
        if (user && await user.comparePassword(password)) {
            // Verificar si el campo access_expiration es null o mayor que la fecha actual
            if (!user.access_expiration || new Date(user.access_expiration) > new Date()) {
                // Generar un token JWT
                
                const token = jwt.sign({ id: user.id, rol_id: user.rol_id }, 'secretKey', { expiresIn: '1h' });

                // Devolver el token y los datos del usuario en la respuesta dentro del campo data
                const jsonResponse = createJSONResponse(200, 'Inicio de sesión exitoso', {
                    token,
                    ...user
                });
                return res.status(200).json(jsonResponse);
            } else {
                const jsonResponse = createJSONResponse(401, 'Credenciales inválidas: Tiempo de acceso expirado', {});
                return res.status(401).json(jsonResponse);
            }
        }

        // Si el usuario no existe o la contraseña no coincide, devolver un error de autenticación
        const jsonResponse = createJSONResponse(401, 'Credenciales inválidas', {});
        res.status(401).json(jsonResponse);
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        const jsonResponse = createJSONResponse(500, 'Error interno del servidor', {});
        res.status(500).json(jsonResponse);
    }
};



export const logout = async (req, res) => {
    try {
        const jsonResponse = createJSONResponse(200, 'logout exitoso', {});
        res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        const jsonResponse = createJSONResponse(500, 'Error interno del servidor', {});
        res.status(500).json(jsonResponse);
    }
};

export const resetPasswordRequest = async (req, res) => {
    try {
        const { email } = req.body;

        // Buscar el usuario por su correo electrónico
        const user = await User.findByEmail(email);

        if (user) {
            // Generar un token de restablecimiento de contraseña
            const resetToken = await generateResetToken(user.id);

            // Envía el correo electrónico de recuperación de contraseña
            const textEmail = `Para restablecer tu contraseña, haz clic en el siguiente enlace: http://tuapp.com/reset-password?token=${resetToken}`;
            await sendEmail(email, 'Recuperación de contraseña', textEmail);

            const jsonResponse = createJSONResponse(200, 'Correo electrónico de recuperación de contraseña enviado correctamente', {});
            res.status(200).json(jsonResponse);
        } else {
            const jsonResponse = createJSONResponse(404, 'El usuario no existe', {});
            res.status(404).json(jsonResponse);
        }
    } catch (error) {
        console.error('Error al solicitar recuperación de contraseña:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Verificar si el token está en la lista de tokens inválidos
        const TokenInvalid = await isTokenInvalid(token);
        
        if (TokenInvalid) {
            // Si el token está en la lista de tokens inválidos, devolver un error
            const jsonResponse = createJSONResponse(400, 'Token inválido o ya utilizado', {});
            return res.status(400).json(jsonResponse);
        }

        // Verificar si el token es válido
        jwt.verify(token, 'resetSecret', async (err, decoded) => {
            if (err) {
                // Si el token no es válido, devolver un error de token inválido
                const jsonResponse = createJSONResponse(400, 'Token inválido', {});
                return res.status(400).json(jsonResponse);
            }

            // Obtener el ID del usuario del token decodificado
            const userId = decoded.userId;

            // Buscar al usuario por su ID
            const user = await User.findById(userId);
            if (!user) {
                // Si el usuario no existe, devolver un error
                const jsonResponse = createJSONResponse(404, 'Usuario no encontrado', {});
                return res.status(404).json(jsonResponse);
            }

            // Validar si la nueva contraseña es igual a la anterior
            const isSamePassword = await user.comparePassword(newPassword);
            if (isSamePassword) {
                // Si la nueva contraseña es igual a la anterior, devolver un error
                const jsonResponse = createJSONResponse(400, 'La nueva contraseña no puede ser igual a la anterior', {});
                return res.status(400).json(jsonResponse);
            }

            // Actualizar la contraseña del usuario en la base de datos a través del modelo
            await User.updatePassword(user.id,newPassword);

            // Marcar el token actual como inválido agregándolo a la lista de tokens inválidos
            await addToInvalidTokens(user.id, token, 'Cambio de contraseña');

            // Devolver una respuesta de éxito
            const jsonResponse = createJSONResponse(200, 'Contraseña actualizada correctamente', {});
            res.status(200).json(jsonResponse);
        });
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        // Ejemplo de respuesta de error utilizando createJSONResponse
        const jsonResponse = createJSONResponse(500, 'Error interno del servidor', {});
        res.status(500).json(jsonResponse);
    }
};