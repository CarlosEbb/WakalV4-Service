// ParametrosConsulta.js

import { executeQuery, validateConnection } from "../utils/dbUtils.js";

export default class ConsultaParametros {
    constructor(id, name, tipo_input, placeholder, column_reference_cliente, created_at, updated_at) {
        this.id = id;
        this.name = name;
        this.tipo_input = tipo_input;
        this.placeholder = placeholder;
        this.column_reference_cliente = column_reference_cliente;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    // Método estático para buscar todos los parámetros de una consulta por su ID de tipo de consulta
    static async findByTipoConsultaId(tipoConsultasId) {
        try {
            const query = `
                SELECT p.id, p.name, p.tipo_input, p.placeholder, p.column_reference_cliente
                FROM consultas_parametros AS cp
                JOIN parametros AS p ON cp.parametro_id = p.id
                WHERE consulta_id = ?;
            `;
            const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, [tipoConsultasId]);
            return result.map(row => new ConsultaParametros(row.id, row.name, row.tipo_input, row.placeholder, row.column_reference_cliente ,row.created_at, row.updated_at));
        } catch (error) {
            console.error('Error al buscar parámetros por ID de tipo de consulta:', error);
            throw error;
        }
    }
}