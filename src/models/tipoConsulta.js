// TipoConsulta.js

import { executeQuery, validateConnection } from "../utils/dbUtils.js";

export default class TipoConsulta {
    constructor(id, clienteId, nombre, type, nameColumnBdCliente, createdAt, updatedAt) {
        this.id = id;
        this.clienteId = clienteId;
        this.nombre = nombre;
        this.type = type;
        this.nameColumnBdCliente = nameColumnBdCliente;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Método estático para buscar todas las consultas de un cliente por su ID
    static async findByClienteId(clienteId) {
        try {
            const query = `
                SELECT *
                FROM tipo_consultas
                WHERE cliente_id = ?;
            `;


            const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, [clienteId]);
            return result.map(row => new TipoConsulta(row.id, row.cliente_id, row.nombre, row.type, row.name_column_bd_cliente, row.created_at, row.updated_at));
        } catch (error) {
            console.error('Error al buscar consultas por cliente ID:', error);
            throw error;
        }
    }
}