//tokenUtils.js
import jwt from 'jsonwebtoken';
import BlacklistedToken from '../models/blacklistedToken.js';

export async function isTokenInvalid(token) {
    try {
        return await BlacklistedToken.isTokenBlacklisted(token);
    } catch (error) {
        console.error('Error al verificar el token en lista negra:', error);
        return true;
    }
}

export async function addToInvalidTokens(user_id, token, reason) {
    try {
        await BlacklistedToken.addToBlacklist(user_id, token, reason);
    } catch (error) {
        console.error('Error al agregar el token a la lista negra:', error);
    }
}

export async function generateResetToken(userId) {
    return jwt.sign({ userId }, 'resetSecret', { expiresIn: '1h' });
}
