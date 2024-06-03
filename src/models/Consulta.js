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

    static async findByClienteIdAndName(cliente_id, nombreConsulta) {
        try {
            // Primero obtenemos las consultas que coinciden con el nombre proporcionado
            const consultaQuery = `
                SELECT id, nombre, cliente_id
                FROM consultas
                WHERE cliente_id = ?
                AND nombre = ?
                ORDER BY id;
            `;
            const consultas = await executeQuery(process.env.DB_CONNECTION_ODBC, consultaQuery, [cliente_id,nombreConsulta]);
            
            
            return consultas;
        } catch (error) {
            console.error('Error al buscar consultas por nombre:', error);
            throw error;
        }
    }

    static async create(cliente_id, data) {
        const { nombre_consulta, parametros } = data;
        
        let idConsulta;

        try {
            const insertConsultaQuery = `
            BEGIN
                INSERT INTO "dba"."consultas" ("nombre","cliente_id")
                VALUES (?, ?);
                SELECT @@IDENTITY AS 'ID';
            END;
            `;
            const insertConsultaParams = [
                nombre_consulta,
                cliente_id
            ];
            
            const consultaResult = await executeQuery(process.env.DB_CONNECTION_ODBC, insertConsultaQuery, insertConsultaParams);
            idConsulta = consultaResult[0].ID; // Suponiendo que retorna el ID generado

            const parametrosArray = parametros.split(';');
            const insertParametroQuery = `
                INSERT INTO "dba"."consultas_parametros" ("consulta_id","parametro_id")
                VALUES (?, ?);
            `;

            for (const parametro_id of parametrosArray) {
                const insertParametroParams = [
                    idConsulta,
                    parametro_id
                ];
                await executeQuery(process.env.DB_CONNECTION_ODBC, insertParametroQuery, insertParametroParams);
            }

            return String(idConsulta); // Retorna el ID de la nueva consulta creada
        } catch (error) {
            console.error('Error al crear una nueva consulta:', error);
            throw error;
        }
    }

    // Método estático para eliminar una consulta
    static async delete(consultaId) {
        try {
            // Eliminar los parámetros asociados a la consulta
            const deleteParametrosQuery = `
                DELETE FROM consultas_parametros
                WHERE consulta_id = ?;
            `;
            await executeQuery(process.env.DB_CONNECTION_ODBC, deleteParametrosQuery, [consultaId]);

            // Eliminar la consulta
            const deleteConsultaQuery = `
                DELETE FROM consultas
                WHERE id = ?;
            `;
            await executeQuery(process.env.DB_CONNECTION_ODBC, deleteConsultaQuery, [consultaId]);

            console.log('Consulta eliminada correctamente');
        } catch (error) {
            console.error('Error al eliminar consulta:', error);
            throw error;
        }
    }
    
}