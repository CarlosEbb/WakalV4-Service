// user.js (modelo de usuario)

import { executeQuery } from '../utils/dbUtils.js';
import bcrypt from 'bcrypt';

export default class User {
    #password; // Propiedad privada

    constructor(data) {
        this.id = data.id;
        this.email = data.email;
        this.#password = data.password;
        this.rol_id = data.rol_id;
        this.nombre_rol = data.nombre_rol;
        this.nombre = data.nombre;
        this.apellido = data.apellido;
        this.prefijo_cedula = data.prefijo_cedula;
        this.cedula = data.cedula;
        this.access_expiration = data.access_expiration;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    getPassword() {
        return this.#password;
    }

    // Método estático para buscar un usuario por su ID
    static async findById(userId) {
        const query = `
            SELECT u.*, r.nombre AS nombre_rol
            FROM usuarios u
            LEFT JOIN roles r ON u.rol_id = r.id
            WHERE u.id = ?
        `;
        const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, [userId]);
        if (result && result.length > 0) {
            return new User(result[0]);
        }
        return null;
    }

    // Método para comparar contraseñas
    async comparePassword(password) {
        return await bcrypt.compare(password, this.getPassword());
    }

    // Método estático para buscar un usuario por su correo electrónico
    static async findByEmail(email) {
        const query = `
            SELECT u.*, r.nombre AS nombre_rol
            FROM usuarios u
            LEFT JOIN roles r ON u.rol_id = r.id
            WHERE u.email = ?
        `;
        const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, [email]);
        if (result && result.length > 0) {
            return new User(result[0]);
        }
        return null;
    }


    static async updatePassword(userId, newPassword) {
        try {
            // Hashear la nueva contraseña antes de almacenarla en la base de datos
            const hashedPassword = await bcrypt.hash(newPassword, 10);
    
            // Actualizar la contraseña del usuario en la base de datos
            const updateQuery = 'UPDATE usuarios SET password = ? WHERE id = ?';
            const updateParams = [hashedPassword, userId];
            await executeQuery(process.env.DB_CONNECTION_ODBC, updateQuery, updateParams);
    
            console.log('Contraseña actualizada correctamente');
        } catch (error) {
            console.error('Error al actualizar la contraseña del usuario:', error);
            throw error;
        }
    }

    static async getAll() {
        const query = `
            SELECT u.*, r.nombre AS nombre_rol
            FROM usuarios u
            LEFT JOIN roles r ON u.rol_id = r.id
        `;
        const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query);
        return result;
    }

    // Método estático para crear un usuario
    static async create(data) {
        try {
            const insertQuery = `
                INSERT INTO usuarios (email, password, rol_id, nombre, apellido, prefijo_cedula, cedula, access_expiration)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const insertParams = [
                data.email,
                data.password,
                data.rol_id,
                data.nombre,
                data.apellido,
                data.prefijo_cedula || null,
                data.cedula || null,
                data.access_expiration || null
            ];
            const result = await executeQuery(process.env.DB_CONNECTION_ODBC, insertQuery, insertParams);
            console.log('Usuario creado correctamente');
            return result.insertId; // Retorna el ID del nuevo usuario creado
        } catch (error) {
            console.error('Error al crear un nuevo usuario:', error);
            throw error;
        }
    }

    // Método estático para actualizar múltiples campos de un usuario por su ID
    static async updateFields(userId, fieldsToUpdate) {
        try {
            const updateQuery = `
                UPDATE usuarios
                SET ${Object.keys(fieldsToUpdate).map(field => `${field} = ?`).join(', ')}
                WHERE id = ?
            `;
            const updateParams = [...Object.values(fieldsToUpdate), userId];
            await executeQuery(process.env.DB_CONNECTION_ODBC, updateQuery, updateParams);
            console.log('Campos actualizados correctamente');
        } catch (error) {
            console.error('Error al actualizar los campos del usuario:', error);
            throw error;
        }
    }

    // Método estático para eliminar un usuario por su ID
    static async delete(userId) {
        try {
            const deleteQuery = 'DELETE FROM usuarios WHERE id = ?';
            await executeQuery(process.env.DB_CONNECTION_ODBC, deleteQuery, [userId]);
            console.log('Usuario eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar el usuario:', error);
            throw error;
        }
    }

}
