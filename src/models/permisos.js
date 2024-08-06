
import { executeQuery } from "../utils/dbUtils.js";

export default class Permisos {
    constructor(data) {
        this.id = data.id;
        this.nombre = data.nombre;
        this.ruta = data.ruta;
        this.descripcion = data.descripcion || null;
    }

    static async create(data) {
        try {
            const insertQuery = `
                BEGIN
                    INSERT INTO permisos (nombre, ruta, descripcion)
                    VALUES (?, ?);
                    SELECT @@IDENTITY AS 'ID';
                END;
            `;
            const insertParams = [
                data.nombre,
                data.ruta,
                data.descripcion
            ];
            const result = await executeQuery(process.env.DB_CONNECTION_ODBC, insertQuery, insertParams);
            console.log('Permiso creado correctamente');
            return result[0].ID;
        } catch (error) {
            console.error('Error al crear un nuevo Permiso:', error);
            throw error;
        }
    }

    // Método para obtener todos los permisos
    static async getAll() {
        let query = `
                SELECT u.* FROM permisos u
            `;
        let params = [];

        const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, params);
        return result;
    }
}
