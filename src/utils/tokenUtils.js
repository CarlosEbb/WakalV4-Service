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
    return jwt.sign({ userId }, process.env.JWT_SECRET_RESET, { expiresIn: '1h' });
}

export async function generateAuthToken(user) {
    return jwt.sign({ id: user.id, rol_id: user.rol_id }, process.env.JWT_SECRET, { expiresIn: '10m' });
}
