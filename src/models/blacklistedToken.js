// blacklistedToken.js (modelo de token en lista negra)

const { executeQuery } = require('../utils/dbUtils');

class BlacklistedToken {
    constructor(data) {
        this.user_id = data.user_id;
        this.token = data.token;
    }

    // Método estático para verificar si un token está en la lista negra
    static async isTokenBlacklisted(token) {
        try {
            const query = 'SELECT COUNT(*) AS count FROM blacklisted_tokens WHERE token = ?';
            const params = [token];
            const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, params);
            return result[0].count > 0;
        } catch (error) {
            console.error('Error al verificar el token en lista negra:', error);
            return true;
        }
    }

    // Método estático para agregar un token a la lista negra
    static async addToBlacklist(user_id, token, reason ) {
        try {
            const insertQuery = 'INSERT INTO blacklisted_tokens (user_id, token, reason) VALUES (?, ?, ?)';
            const insertParams = [user_id, token, reason];
            await executeQuery(process.env.DB_CONNECTION_ODBC, insertQuery, insertParams);
        } catch (error) {
            console.error('Error al agregar el token a la lista negra:', error);
        }
    }
}

module.exports = BlacklistedToken;