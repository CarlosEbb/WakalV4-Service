import { executeQuery } from '../utils/dbUtils.js';

export default class Auditoria {
    constructor(data) {
        this.id = data.id.toString(); // Convertir el id a una cadena
        this.usuario_id = data.usuario_id;
        this.rol_id = data.rol_id;
        this.ruta = data.ruta;
        this.method = data.method;
        this.body = data.body;
        this.ip_cliente = data.ip_cliente;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async getAll(user = null) {
        let query = `
            SELECT *
            FROM auditorias
        `;
        let params = [];
    
        // Si se proporciona un rol_id, filtra las auditorias según el rol del usuario
        if (user !== null) {
            query += ' WHERE rol_id = ?';
            params.push(user.rol_id);
        }
    
        const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, params);
    
        // Mapea cada objeto de resultado a una nueva instancia de Auditoria
        const auditorias = result.map(auditoriaData => new Auditoria(auditoriaData));
    
        return auditorias;
    }
    
}
