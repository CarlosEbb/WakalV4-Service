import { executeQuery } from '../utils/dbUtils.js';

export default class Auditoria {
    constructor(data) {
        this.id = data.id.toString(); // Convertir el id a una cadena
        this.usuario_id = data.usuario_id;
        this.rol_id = data.rol_id;
        this.ruta = data.ruta;
        this.method = data.method;
        this.body = data.body;

        this.nombre_rol = data.nombre_rol;
        this.username = data.username;
        this.nombre_usuario = data.nombre_usuario;
        this.apellido_usuario = data.apellido_usuario;

        this.ip_cliente = data.ip_cliente;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async getAll(user = null, limit = 10, offset = 1) {
        let order = "DESC";
        let query = `
            SELECT TOP ${limit} START AT ${offset}
                a.*, 
                r.nombre AS nombre_rol, 
                u2.username, 
                u2.nombre AS nombre_usuario, 
                u2.apellido AS apellido_usuario
            FROM 
                auditorias a
                JOIN roles r ON a.rol_id = r.id
                JOIN usuarios u2 ON a.usuario_id = u2.id
        `;
        let params = [];

        if (user) {
            if (user.rol_id === 2) {
                query += ` WHERE a.rol_id = ?`;
                params.push(user.rol_id);
            } else if (user.rol_id === 3) {
                query += ` 
                    JOIN usuarios_clientes uc ON uc.user_id = a.usuario_id
                    WHERE a.rol_id = ? AND a.usuario_id = ? AND uc.cliente_id = ?
                `;
                params.push(user.rol_id, user.user_id, user.cliente_id);
            }
        }

        query += ` ORDER BY a.created_at ${order}`;

        const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, params);
        // Mapea cada objeto de resultado a una nueva instancia de Auditoria
        const auditorias = result.map(auditoriaData => new Auditoria(auditoriaData));


        return auditorias;
    }
}
