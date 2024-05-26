// TipoConsulta.js

import { executeQuery, validateConnection } from "../utils/dbUtils.js";

export default class Consulta {
    constructor(id, nombre, cliente_id, created_at, updated_at) {
        this.id = id;
        this.nombre = nombre;
        this.cliente_id = cliente_id;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    // Método estático para buscar todas las consultas de un cliente por su ID
    static async findByClienteId(clienteId) {
        try {
            // const query = `
            //     SELECT c.nombre, p.name, p.tipo_input, p.placeholder, p.column_reference_cliente
            //     FROM consultas AS c
            //     JOIN consultas_parametros AS cp ON c.id = cp.consulta_id
            //     JOIN parametros AS p ON cp.parametro_id = p.id
            //     WHERE c.cliente_id = ?;
            // `;
            const query = `
                SELECT id, nombre, cliente_id
                FROM consultas
                WHERE cliente_id = ?
                ORDER BY id;
            `;


            const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, [clienteId]);
           
            return result.map(row => new Consulta(row.id, row.nombre, row.cliente_id, row.created_at, row.updated_at));
        } catch (error) {
            console.error('Error al buscar consultas por cliente ID:', error);
            throw error;
        }
    }
}