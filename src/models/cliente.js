// cliente.js (modelo de cliente)

import { executeQuery, validateConnection } from "../utils/dbUtils"

class Cliente {
    constructor(data) {
        this.id = data.id;
        this.rif = data.rif;
        this.nombre_cliente = data.nombre_cliente;
        this.connections = data.connections || null;
        this.logo = data.logo || null;
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
    }

    // Método para crear un nuevo cliente
    static async create(data) {
        try {
            const insertQuery = `
                INSERT INTO clientes (rif, nombre_cliente, connections, logo)
                VALUES (?, ?, ?, ?)
            `;
            const insertParams = [
                data.rif,
                data.nombre_cliente,
                data.connections || null,
                data.logo || null
            ];
            const result = await executeQuery(process.env.DB_CONNECTION_ODBC, insertQuery, insertParams);
            return result.insertId;
        } catch (error) {
            console.error('Error al crear un nuevo cliente:', error);
            throw error;
        }
    }

    // Método para obtener todos los clientes
    static async getAll() {
        try {
            const query = 'SELECT * FROM clientes';
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

    // Método para obtener un cliente por su ID
    static async findById(clienteId) {
        try {
            const query = 'SELECT * FROM clientes WHERE id = ?';
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
            const updateParams = [...Object.values(fieldsToUpdate), clienteId];
            await executeQuery(process.env.DB_CONNECTION_ODBC, updateQuery, updateParams);
    
            console.log('Campos actualizados correctamente');
        } catch (error) {
            console.error('Error al actualizar los campos del cliente:', error);
            throw error;
        }
    }

    // Método para eliminar un cliente por su ID
    static async delete(clienteId) {
        try {
            const deleteQuery = 'DELETE FROM clientes WHERE id = ?';
            await executeQuery(process.env.DB_CONNECTION_ODBC, deleteQuery, [clienteId]);
            console.log('Cliente eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar el cliente:', error);
            throw error;
        }
    }
}

module.exports = Cliente;
