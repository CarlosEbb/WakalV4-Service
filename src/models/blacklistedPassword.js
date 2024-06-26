import { executeQuery } from '../utils/dbUtils.js';

export default class BlacklistedPassword {
    constructor(data) {
        this.user_id = data.user_id;
        this.password = data.password;
    }

    // Método estático para agregar una contraseña a la lista negra
    static async addToBlacklist(user_id, password) {
        try {
            const insertQuery = 'INSERT INTO blacklisted_password (user_id, password) VALUES (?, ?)';
            console.log(user_id, password);
            const insertParams = [user_id, password];
            await executeQuery(process.env.DB_CONNECTION_ODBC, insertQuery, insertParams);
        } catch (error) {
            console.error('Error al agregar la contraseña a la lista negra:', error);
        }
    }

     // Método estático para obtener las últimas 8 contraseñas del usuario
     static async getLastPasswords(user_id) {
        const number = process.env.NUMBER_LAST_PASSWORDS;
        try {
            const query = `SELECT TOP ${number} password FROM blacklisted_password WHERE user_id = ? ORDER BY created_at DESC`;
            const params = [user_id];
            
            const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, params);
            
            return result.map(row => row.password);
        } catch (error) {
            console.error(`Error al obtener las últimas ${number} contraseñas:`, error);
            return [];
        }
    }
}
