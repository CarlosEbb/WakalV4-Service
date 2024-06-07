// TipoConsulta.js

import { executeQuery, validateConnection } from "../utils/dbUtils.js";

export default class Consulta {
    constructor(id, nombre, cliente_id, roles, created_at, updated_at) {
        this.id = id;
        this.nombre = nombre;
        this.cliente_id = cliente_id;
        this.roles = roles || [];
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    

     // Método estático para buscar todas las consultas de un cliente por su ID
     static async findByClienteId(clienteId) {
        try {
            const query = `
                SELECT c.id, c.nombre, c.cliente_id, c.created_at, c.updated_at,
                       (SELECT LIST(cr.rol_id, ',')
                        FROM consultas_roles AS cr
                        WHERE cr.consulta_id = c.id) AS roles
                FROM consultas AS c
                WHERE c.cliente_id = ?
                ORDER BY c.id;
            `;

            const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, [clienteId]);

            return result.map(row => {
                const roles = row.roles ? row.roles.split(',').map(role => role.trim()) : [];
                return new Consulta(row.id, row.nombre, row.cliente_id, roles, row.created_at, row.updated_at);
            });
        } catch (error) {
            console.error('Error al buscar consultas por cliente ID:', error);
            throw error;
        }
    }
    

     // Método estático para buscar todas las consultas de un cliente por su ID y rol
     static async findByClienteIdAndRolId(clienteId, rolId) {
        try {
            const query = `
                SELECT c.id, c.nombre, c.cliente_id, c.created_at, c.updated_at,
                    (SELECT LIST(cr.rol_id, ',')
                        FROM consultas_roles AS cr
                        WHERE cr.consulta_id = c.id) AS roles
                FROM consultas AS c
                JOIN consultas_roles AS cr ON c.id = cr.consulta_id
                WHERE c.cliente_id = ? AND cr.rol_id = ?
                ORDER BY c.id;
            `;

            const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, [clienteId, rolId]);

            return result.map(row => {
                const roles = row.roles ? row.roles.split(',').map(role => role.trim()) : [];
                return new Consulta(row.id, row.nombre, row.cliente_id, roles, row.created_at, row.updated_at);
            });
        } catch (error) {
            console.error('Error al buscar consultas por cliente ID y rol ID:', error);
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
        const { nombre_consulta, parametros, tipo_rol } = data;
        
        let idConsulta;

        try {
            const insertConsultaQuery = `
            BEGIN
                INSERT INTO consultas ("nombre","cliente_id")
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

            // Insertar parámetros
            const parametrosArray = parametros;
            const insertParametroQuery = `
                INSERT INTO consultas_parametros ("consulta_id","parametro_id")
                VALUES (?, ?);
            `;

            for (const parametro_id of parametrosArray) {
                const insertParametroParams = [
                    idConsulta,
                    parametro_id
                ];
                await executeQuery(process.env.DB_CONNECTION_ODBC, insertParametroQuery, insertParametroParams);
            }

            // Insertar roles
            const rolesArray = tipo_rol;
            const insertRolQuery = `
                INSERT INTO consultas_roles ("consulta_id", "rol_id")
                VALUES (?, ?);
            `;

            for (const rol_id of rolesArray) {
                const insertRolParams = [
                    idConsulta,
                    rol_id
                ];
                await executeQuery(process.env.DB_CONNECTION_ODBC, insertRolQuery, insertRolParams);
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
            // Eliminar los roles asociados a la consulta
            const deleteRolesQuery = `
                DELETE FROM consultas_roles
                WHERE consulta_id = ?;
            `;
            await executeQuery(process.env.DB_CONNECTION_ODBC, deleteRolesQuery, [consultaId]);

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