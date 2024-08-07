import { executeQuery } from "../utils/dbUtils.js";

export default class PermisosUsuarios {
    constructor(data) {
        this.id = data.id;
        this.usuario_id = data.usuarios_id;
        this.permisos_id = data.permisos_id;
    }

    static async create(data) {
        try {
            const insertQuery = `
                BEGIN
                    INSERT INTO permisos_usuarios (usuario_id, permisos_id)
                    VALUES (?, ?);
                    SELECT @@IDENTITY AS 'ID';
                END;
            `;
            const insertParams = [
                data.user_id,
                data.permisos_id
            ];
            const result = await executeQuery(process.env.DB_CONNECTION_ODBC, insertQuery, insertParams);
            console.log('Permiso Usuario creado correctamente');
            return String(result[0].ID);
        } catch (error) {
            console.error('Error al crear un nuevo Permiso Usuario:', error);
            throw error;
        }
    }
    // Para obtener todos los permisos de un usuario
    static async getAllByUsuario(user_id) {
        let query = `
                SELECT u.*, p.nombre, p.descripcion, p.ruta FROM permisos_usuarios u 
                RIGHT JOIN permisos p on u.permisos_id=p.id where u.usuario_id=?;
            `;
        let params = [user_id];

        const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, params);
        return result;
    }

    static async checkPermissionAndUser(data) {
        let query = `
                SELECT u.* FROM permisos_usuarios u where u.usuario_id=? and u.permisos_id=?;
            `;
        let params = [data.user_id, data.permisos_id];

        const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, params);
        return result;
    }
}
