// ParametrosConsulta.js

import { executeQuery, validateConnection } from "../utils/dbUtils.js";

export default class ParametrosConsulta {
    constructor(id, tipoConsultasId, nombre, value, createdAt, updatedAt) {
        this.id = id;
        this.tipoConsultasId = tipoConsultasId;
        this.nombre = nombre;
        this.value = value;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Método estático para buscar todos los parámetros de una consulta por su ID de tipo de consulta
    static async findByTipoConsultaId(tipoConsultasId) {
        try {
            const query = `
                SELECT *
                FROM parametros_consultas
                WHERE tipo_consultas_id = ?;
            `;
            const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, [tipoConsultasId]);
            return result.map(row => new ParametrosConsulta(row.id, row.tipo_consultas_id, row.nombre, row.value, row.created_at, row.updated_at));
        } catch (error) {
            console.error('Error al buscar parámetros por ID de tipo de consulta:', error);
            throw error;
        }
    }
}