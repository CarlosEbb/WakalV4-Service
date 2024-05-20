// cliente.js (modelo de cliente)

import { executeQuery, validateConnection } from "../utils/dbUtils.js";

export default class Cliente {
    constructor(data) {
        this.id = data.id;
        this.rif = data.rif;
        this.nombre_cliente = data.nombre_cliente;
        this.is_prod = data.is_prod || null;
        this.connections = data.connections || null;

        this.logo = data.logo || null;
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
        this.enabled = data.enabled || null;

        this.url_prod = data.url_prod || null;
        this.url_qa = data.url_qa || null;
        this.name_bd_column_encrypt = data.name_bd_column_encrypt || null;
        this.name_bd_column_encrypt_others = data.name_bd_column_encrypt_others || null;

        this.encrypt_url_format = data.encrypt_url_format || null;
        this.encrypt_url_format_order = data.encrypt_url_format_order || null;

        this.name_bd_table = data.name_bd_table || null;
        this.name_bd_table_coletilla = data.name_bd_table_coletilla || null;

        this.name_bd_column_numero_control = data.name_bd_column_numero_control || null;
        this.name_bd_column_fecha_emision = data.name_bd_column_fecha_emision || null;
        this.name_bd_column_fecha_emision_format = data.name_bd_column_fecha_emision_format || null;
        this.name_bd_column_fecha_asignacion = data.name_bd_column_fecha_asignacion || null;
        this.name_bd_column_fecha_asignacion_format = data.name_bd_column_fecha_asignacion_format || null;
        this.name_bd_column_numero_documento = data.name_bd_column_numero_documento || null;
        this.name_bd_column_numero_documento_format = data.name_bd_column_numero_documento_format || null;

        this.name_bd_column_tipo_documento = data.name_bd_column_tipo_documento || null;
        this.name_bd_column_tipo_documento_format = data.name_bd_column_tipo_documento_format || null;
        this.name_bd_column_tipo_documento_view_pdf_format = data.name_bd_column_tipo_documento_view_pdf_format || null;
        this.numero_control_view_pdf_format = data.numero_control_view_pdf_format || null;

        this.name_bd_column_rif = data.name_bd_column_rif || null;
        this.name_bd_column_razon_social = data.name_bd_column_razon_social || null;

        this.name_bd_column_codigo_operacion = data.name_bd_column_codigo_operacion || null;
        this.name_bd_column_serie = data.name_bd_column_serie || null;
        this.name_bd_column_hora_emision = data.name_bd_column_hora_emision || null;
        this.name_bd_column_status = data.name_bd_column_status || null;
        this.name_bd_column_motivo_anulacion = data.name_bd_column_motivo_anulacion || null;
        this.name_bd_column_fecha_anulacion = data.name_bd_column_fecha_anulacion || null;
        this.name_bd_column_hora_anulacion = data.name_bd_column_hora_anulacion || null; 

        this.name_bd_column_neto_pagar = data.name_bd_column_neto_pagar || null; 
        this.name_bd_column_igtf = data.name_bd_column_igtf || null; 
        this.name_bd_column_total_pagar = data.name_bd_column_total_pagar || null; 
        this.name_bd_column_base_imponible = data.name_bd_column_base_imponible || null; 
        this.name_bd_column_monto_iva = data.name_bd_column_monto_iva || null; 
        this.name_bd_column_monto_exento = data.name_bd_column_monto_exento || null; 
        this.name_bd_column_monto_no_sujeto = data.name_bd_column_monto_no_sujeto || null; 
        
    }

    // Método estático para buscar un cliente por su RIF
    static async findByRif(rif) {
        try {
            const query = 'SELECT * FROM clientes WHERE rif = ?';
            const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, [rif]);
            if (result && result.length > 0) {
                return new Cliente(result[0]);
            }
            return null;
        } catch (error) {
            console.error('Error al obtener el cliente por RIF:', error);
            throw error;
        }
    }

    // Método estático para verificar si el RIF existe y si el cliente asociado está marcado como eliminado lógicamente
    static async rifExists(rif) {
        try {
            const query = `
                SELECT id, enabled
                FROM clientes
                WHERE rif = ?;
            `;
            const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, [rif]);
            if (result && result.length > 0) {
                const client = result[0];
                if (client.enabled == 1) {
                    return { exists: true, deleted: false, clientId: client.id }; // Si el cliente está habilitado, devolver el ID del cliente
                } else {
                    return { exists: true, deleted: true, clientId: client.id }; // Si el cliente está marcado como eliminado, devolver un objeto indicando que existe pero está eliminado, junto con el ID del cliente
                }
            }
            return { exists: false }; // Si no se encuentra ningún registro, devolver un objeto indicando que no existe
        } catch (error) {
            console.error('Error al verificar si el RIF existe:', error);
            throw error;
        }
    }

    // Método para crear un nuevo cliente
    static async create(data) {
        console.log(data);
        try {
            const insertQuery = `
            BEGIN
                INSERT INTO clientes (rif, nombre_cliente, connections, logo)
                VALUES (?, ?, ?, ?);
                SELECT @@IDENTITY AS 'ID';
            END;
            `;
            const insertParams = [
                data.rif,
                data.nombre_cliente,
                data.connections || null,
                data.logo || null
            ];
            const result = await executeQuery(process.env.DB_CONNECTION_ODBC, insertQuery, insertParams);
            return String(result[0].ID); // Retorna el ID del nuevo cliente creado
        } catch (error) {
            console.error('Error al crear un nuevo cliente:', error);
            throw error;
        }
    }

    // Método para obtener todos los clientes que no han sido eliminados lógicamente
    static async getAll() {
        try {
            const query = 'SELECT * FROM clientes WHERE enabled = 1 order by nombre_cliente';
            const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query);
            return result;
        } catch (error) {
            console.error('Error al obtener todos los clientes:', error);
            throw error;
        }
    }

    // Método estático para obtener todos los clientes con estado de conexión a BD
    static async getAllWithConnectionStatus() {
        try {
            // Obtener todos los clientes
            const clientes = await Cliente.getAll();

            // Array para almacenar los clientes con estado de conexión
            const clientesConEstado = [];

            // Recorrer cada cliente y validar la conexión
            for (const cliente of clientes) {
                try {
                    // Aquí obtienes el estado de conexión para el cliente
                    const isConnected = await validateConnection(cliente.connections);

                    // Convertir valores BigInt a cadenas de texto
                    cliente.id = cliente.id.toString();
                    // Si hay otros campos BigInt, conviértelos de manera similar

                    // Agregar el estado de la conexión al objeto cliente
                    cliente.isConnected = isConnected;

                    // Agregar el cliente modificado al array
                    clientesConEstado.push(cliente);
                } catch (error) {
                    console.error(`Error al validar la conexión del cliente ${cliente.id}:`, error);
                    // Si hay un error al validar la conexión, se agrega el cliente sin estado de conexión
                    clientesConEstado.push(cliente);
                }
            }

            return clientesConEstado;
        } catch (error) {
            console.error('Error al obtener todos los clientes:', error);
            throw error;
        }
    }

    // Método para obtener un cliente por su ID que no haya sido eliminado lógicamente
    static async findById(clienteId) {
        try {
            const query = 'SELECT * FROM clientes WHERE id = ? AND enabled = 1';
            const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, [clienteId]);
            if (result && result.length > 0) {
                return new Cliente(result[0]);
            }
            return null;
        } catch (error) {
            console.error('Error al obtener el cliente por ID:', error);
            throw error;
        }
    }

    // Método estático para actualizar múltiples campos de un usuario por su ID
    static async updateFields(clienteId, fieldsToUpdate) {
        try {
            // Crear la consulta de actualización con los campos dinámicos
            const updateQuery = `
                UPDATE clientes
                SET ${Object.keys(fieldsToUpdate).map(field => `${field} = ?`).join(', ')}
                WHERE id = ?
            `;
            console.log(updateQuery);
            const updateParams = [...Object.values(fieldsToUpdate), clienteId];
            console.log(updateParams);
            await executeQuery(process.env.DB_CONNECTION_ODBC, updateQuery, updateParams);
    
            console.log('Campos actualizados correctamente');
        } catch (error) {
            console.error('Error al actualizar los campos del cliente:', error);
            throw error;
        }
    }

    // Método estático para eliminar lógicamente un cliente por su ID
    static async delete(clienteId) {
        try {
            const updateQuery = 'UPDATE clientes SET enabled = 0 WHERE id = ?';
            await executeQuery(process.env.DB_CONNECTION_ODBC, updateQuery, [clienteId]);
            console.log('Cliente eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar lógicamente el cliente:', error);
            throw error;
        }
    }
}
