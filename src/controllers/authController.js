//authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import User from '../models/user.js';
import BlacklistedPassword from '../models/blacklistedPassword.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import moment from 'moment';

import { generateResetToken, generateAuthToken, isTokenInvalid, addToInvalidTokens } from '../utils/tokenUtils.js';
import { createJSONResponse } from '../utils/responseUtils.js';
import { insertAuditoria } from '../utils/auditUtils.js';
import { sendEmail } from '../utils/emailController.js';
import Joi from 'joi';
BlacklistedPassword
//import * as dotenv from 'dotenv' dotenv.config();
//require('dotenv').config();

export const login = async (req, res) => {
    try {
        if (!req.body || !req.body.email || !req.body.password) {
            const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: ['Solicitud incorrecta: El cuerpo de la solicitud debe contener email y password'] });
            return res.status(400).json(jsonResponse);
        }

        const { email, password } = req.body;

        // Buscar el usuario por su correo electrónico
        const user = await User.findByEmailOrUsername(email);

        // Verificar si se encontró un usuario
        if (user) {
            // Verificar si el usuario está bloqueado debido a intentos fallidos
            if (user.failed_attempts >= 3) {
                const jsonResponse = createJSONResponse(403, 'Acceso denegado', { errors: ['Su cuenta ha sido bloqueada debido a múltiples intentos fallidos. Por favor, restablezca la contraseña.'] });
                return res.status(403).json(jsonResponse);
            }

            // Verificar si la contraseña coincide
            if (await user.comparePassword(password)) {
                // Restablecer los intentos fallidos
                await User.updateFields(user.id, { failed_attempts: 0 });

                // Verificar si el campo access_expiration es null o mayor que la fecha actual
                if (!user.access_expiration || new Date(user.access_expiration) > new Date()) {
                    // Generar un token JWT
                    const token = await generateAuthToken(user);

                    // Actualizar ultima_conexion
                    const now = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
                    await User.updateFields(user.id, { ultima_conexion: now });

                    // Devolver el token y los datos del usuario en la respuesta dentro del campo data
                    const jsonResponse = createJSONResponse(200, 'Inicio de sesión exitoso', {
                        token,
                        ...user
                    });

                    return res.status(200).json(jsonResponse);
                } else {
                    const jsonResponse = createJSONResponse(401, 'Datos de entrada no válidos', { errors: ['Acceso denegado: La validez de su contraseña ha terminado o el tiempo de acceso ha expirado. '] });
                    return res.status(401).json(jsonResponse);
                }
            } else {
                // Incrementar los intentos fallidos
                await User.updateFields(user.id, { failed_attempts: user.failed_attempts + 1 });

                // Si la contraseña no coincide, devolver un error de autenticación
                const jsonResponse = createJSONResponse(401, 'Datos de entrada no válidos', { errors: ['Credenciales inválidas'] });
                return res.status(401).json(jsonResponse);
            }
        } else {
            // Si el usuario no existe, devolver un error de autenticación
            const jsonResponse = createJSONResponse(401, 'Datos de entrada no válidos', { errors: ['Credenciales inválidas'] });
            return res.status(401).json(jsonResponse);
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        const jsonResponse = createJSONResponse(500, 'Error interno del servidor ' + JSON.stringify(error), {});
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
        const user = await User.findByEmailOrUsername(email);
        
        if (user) {
            // Generar un token de restablecimiento de contraseña
            const resetToken = await generateResetToken(user.id);

            // Obtener la ruta del archivo actual
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);

            // Construir la ruta al archivo HTML
            const filePath = path.join(__dirname, '..', 'views', 'email', 'resetPassword.html');

            // Leer el contenido del archivo HTML
            const htmlEmail = fs.readFileSync(filePath, 'utf8');
            
             // Reemplazar variables en el HTML
            let replacedHtmlEmail = htmlEmail.replace('{{reset_token}}', process.env.APP_URL+"/auth/resetPassword?email="+user.email+"&token="+resetToken);
            replacedHtmlEmail = replacedHtmlEmail.replace('{{first_name}}', user.nombre);
            replacedHtmlEmail = replacedHtmlEmail.replace('{{last_name}}', user.apellido);
            replacedHtmlEmail = replacedHtmlEmail.replace('{{correo_user}}', email);
            replacedHtmlEmail = replacedHtmlEmail.replace('{{url_app}}', process.env.APP_URL);

             // Envía el correo electrónico de recuperación de contraseña con el HTML cargado desde el archivo
             await sendEmail(email, 'Recuperación de contraseña', replacedHtmlEmail);
 
             const jsonResponse = createJSONResponse(200, 'Correo electrónico de recuperación de contraseña enviado correctamente', {});
             res.status(200).json(jsonResponse);
        } else {
            const jsonResponse = createJSONResponse(404, 'Datos de entrada no válidos', { errors: ['El correo electrónico no coincide con nuestros registros'] });
            res.status(404).json(jsonResponse);
        }
    } catch (error) {
        console.error('Error al solicitar recuperación de contraseña:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const schema = Joi.object({
  newPassword: Joi.string()
    .min(10)
    .message('La contraseña debe tener al menos 10 caracteres.')
    .pattern(new RegExp('^(?=.*[a-z])'))
    .message('La contraseña debe contener al menos una letra minúscula.')
    .pattern(new RegExp('^(?=.*[A-Z])'))
    .message('La contraseña debe contener al menos una letra mayúscula.')
    .pattern(new RegExp('^(?=.*[0-9])'))
    .message('La contraseña debe contener al menos un número.')
    .pattern(new RegExp('^(?=.*[!@#$%^&*(),.?":{}|<>])'))
    .message('La contraseña debe contener al menos un carácter especial.')
    .required()
    .messages({
      'string.base': 'La contraseña debe ser un texto.',
      'string.empty': 'La contraseña no puede estar vacía.',
      'string.min': 'La contraseña debe tener al menos 6 caracteres.',
      'string.pattern.base': 'La contraseña no cumple con los requisitos de complejidad.',
      'any.required': 'La contraseña es un campo requerido.'
    }),
    token: Joi.string().required()
});
  
export const changePassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const TokenInvalid = await isTokenInvalid(token);

        if (TokenInvalid) {
            const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: ['¡Ups! El token que has introducido no es válido o ya ha sido utilizado'] });
            return res.status(400).json(jsonResponse);
        }

        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const validationErrors = error.details.map(detail => detail.message.replace(/['"]/g, ''));
            const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: validationErrors });
            return res.status(400).json(jsonResponse);
        }

        jwt.verify(token, process.env.JWT_SECRET_RESET, async (err, decoded) => {
            if (err) {
                const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: ['¡Ups! El token que has introducido no es válido o ya ha sido utilizado'] });
                return res.status(400).json(jsonResponse);
            }

            const userId = decoded.userId;
            const user = await User.findById(userId);

            if (!user) {
                const jsonResponse = createJSONResponse(404, 'Datos de entrada no válidos', { errors: ['Usuario no encontrado'] });
                return res.status(404).json(jsonResponse);
            }

            const lastPasswords = await BlacklistedPassword.getLastPasswords(userId);

            const isBlacklisted = await Promise.all(
                lastPasswords.map(async (hash) => await bcrypt.compare(newPassword, hash))
            );

            if (isBlacklisted.includes(true)) {
                const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: [`La nueva contraseña no puede ser igual a ninguna de las últimas ${process.env.NUMBER_LAST_PASSWORDS} contraseñas utilizadas`] });
                return res.status(400).json(jsonResponse);
            }

            const hashedNewPassword = await User.updatePassword(user.id, newPassword);
            await addToInvalidTokens(user.id, token, 'Cambio de contraseña');
            await BlacklistedPassword.addToBlacklist(user.id, hashedNewPassword); // añadir la contraseña actual a la lista negra

            // Restablecer los intentos fallidos a 0 y actualizar la fecha de expiración de acceso
            const expirationDays = parseInt(process.env.ACCESS_EXPIRATION_DAYS);
            const newAccessExpiration = moment().add(expirationDays, 'days').format('YYYY-MM-DD');

            await User.updateFields(user.id, { 
                failed_attempts: 0,
                access_expiration: newAccessExpiration 
            });

            const jsonResponse = createJSONResponse(200, 'Contraseña actualizada correctamente', {});
            res.status(200).json(jsonResponse);
        });
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        const jsonResponse = createJSONResponse(500, 'Error interno del servidor', {});
        res.status(500).json(jsonResponse);
    }
};


export const tokenVerify = async (req, res) => {
    try {
        const {token, type} = req.body;

        // Verificar si el token está en la lista de tokens inválidos
        const TokenInvalid = await isTokenInvalid(token);
        
        if (TokenInvalid) {
            // Si el token está en la lista de tokens inválidos, devolver un error
            const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: ['El token proporcionado es inválido.'] });
            return res.status(400).json(jsonResponse);
        }
        
        const secretKey = type === "ResetToken" ? process.env.JWT_SECRET_RESET : type === "AuthToken" ? process.env.JWT_SECRET : null;

        if (!secretKey) {
            const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: ['El token proporcionado es inválido.'] });
            return res.status(400).json(jsonResponse);
        }
        
        jwt.verify(token, secretKey, async (err, decoded) => {
            if (err) {
                console.log(err);
                const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: ['El token proporcionado es inválido.'] });
                return res.status(400).json(jsonResponse);
            }
            const jsonResponse = createJSONResponse(200, '¡Éxito! El token es válido.', {});
            res.status(200).json(jsonResponse);
        });
        
    } catch (error) {
        console.error('Error al validar el token:', error);
        // Ejemplo de respuesta de error utilizando createJSONResponse
        const jsonResponse = createJSONResponse(500, 'Error interno del servidor', {});
        res.status(500).json(jsonResponse);
    }
};