import { executeQuery } from '../utils/dbUtils.js';

export default class Rol {
    constructor(data) {
        this.id = data.id;
        this.nombre = data.nombre;
        this.descripcion = data.descripcion;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async getAll(user = null) {
        let query = `
            SELECT *
            FROM roles
        `;
        let params = [];
    
        // Si se proporciona un usuario, filtra los roles según el rol del usuario
        if (user !== null) {
            query += ' WHERE id = ?';
            params.push(user.rol_id);
        }
    
        const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, params);
    
        // Mapea cada objeto de resultado a una nueva instancia de Rol
        const roles = result.map(rolData => new Rol(rolData));
    
        return roles;
    }
    
}