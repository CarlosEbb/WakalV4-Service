//tokenUtils.js
const jwt = require('jsonwebtoken');
const BlacklistedToken = require('../models/blacklistedToken');

async function isTokenInvalid(token) {
    try {
        return await BlacklistedToken.isTokenBlacklisted(token);
    } catch (error) {
        console.error('Error al verificar el token en lista negra:', error);
        return true;
    }
}

async function addToInvalidTokens(user_id, token, reason) {
    try {
        await BlacklistedToken.addToBlacklist(user_id, token, reason);
    } catch (error) {
        console.error('Error al agregar el token a la lista negra:', error);
    }
}

async function generateResetToken(userId) {
    return jwt.sign({ userId }, 'resetSecret', { expiresIn: '1h' });
}

module.exports = {
    isTokenInvalid,
    addToInvalidTokens,
    generateResetToken
};
