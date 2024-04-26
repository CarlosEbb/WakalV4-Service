
import { executeQuery, validateConnection } from "../utils/dbUtils.js";

export default class UserCliente {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.cliente_id = data.cliente_id;
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
    }

    static async create(data) {
        try {
            const insertQuery = `
                BEGIN
                    INSERT INTO "dba"."usuarios_clientes" (user_id, cliente_id)
                    VALUES (?, ?);
                    SELECT @@IDENTITY AS 'ID';
                END;
            `;
            const insertParams = [
                data.user_id,
                data.cliente_id,
            ];
            const result = await executeQuery(process.env.DB_CONNECTION_ODBC, insertQuery, insertParams);
            console.log('Relacion Usuario Cliente creado correctamente');
            return result[0].ID;
        } catch (error) {
            console.error('Error al crear un nuevo usuario_cliente:', error);
            throw error;
        }
    }
}
