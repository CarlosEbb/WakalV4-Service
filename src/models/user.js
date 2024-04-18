// user.js (modelo de usuario)

import { executeQuery } from '../utils/dbUtils.js';
import bcrypt from 'bcrypt';


export default class User {
    #password; // Propiedad privada

    constructor(data) {
        this.id = data.id;
        this.email = data.email;
        this.email_alternativo = data.email_alternativo;
        this.#password = data.password;
        this.rol_id = data.rol_id;
        this.nombre_rol = data.nombre_rol;
        this.nombre = data.nombre;
        this.apellido = data.apellido;
        this.prefijo_cedula = data.prefijo_cedula;
        this.cedula = data.cedula;
        this.access_expiration = data.access_expiration;
        this.ultima_conexion = data.ultima_conexion;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;

        this.registered_by_user_id = data.registered_by_user_id;
        this.enabled = data.enabled;
    }

    getPassword() {
        return this.#password;
    }

    // Método estático para buscar un usuario por su ID que no haya sido eliminado lógicamente
    static async findById(userId) {
        const query = `
            SELECT u.*, r.nombre AS nombre_rol
            FROM usuarios u
            LEFT JOIN roles r ON u.rol_id = r.id
            WHERE u.id = ? AND u.enabled = 1
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

    // Método estático para buscar un usuario por su correo electrónico que no haya sido eliminado lógicamente
    static async findByEmail(email) {
        const query = `
            SELECT u.*, r.nombre AS nombre_rol
            FROM usuarios u
            LEFT JOIN roles r ON u.rol_id = r.id
            WHERE (u.email = ? OR u.email_alternativo = ?) AND u.enabled = 1
        `;
        const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, [email, email]);
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

    // Método para obtener todos los usuarios que no han sido eliminados lógicamente
    static async getAll() {
        const query = `
            SELECT u.*, r.nombre AS nombre_rol
            FROM usuarios u
            LEFT JOIN roles r ON u.rol_id = r.id
            WHERE u.enabled = 1
        `;
        const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query);
        return result;
    }
    
    // Método estático para verificar si el correo electrónico existe y si el usuario asociado está marcado como eliminado lógicamente
    static async emailExists(email) {
        try {
            const query = `
                SELECT id, enabled
                FROM usuarios
                WHERE email = ?;
            `;
            const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, [email]);
            if (result && result.length > 0) {
                const user = result[0];
                if (user.enabled == 1) {
                    return { exists: true, deleted: false, userId: user.id }; // Si el usuario está habilitado, devolver el ID del usuario
                } else {
                    return { exists: true, deleted: true, userId: user.id }; // Si el usuario está marcado como eliminado, devolver un objeto indicando que existe pero está eliminado, junto con el ID del usuario
                }
            }
            return { exists: false }; // Si no se encuentra ningún registro, devolver un objeto indicando que no existe
        } catch (error) {
            console.error('Error al verificar si el correo electrónico existe:', error);
            throw error;
        }
    }

    // Método estático para crear un usuario
    static async create(data) {
        try {
            const insertQuery = `
                INSERT INTO usuarios (email, password, rol_id, nombre, apellido, prefijo_cedula, cedula, access_expiration, registered_by_user_id, enabled)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            // Hashear la contraseña antes de almacenarla en la base de datos
            const hashedPassword = await bcrypt.hash(data.password, 10);

            const insertParams = [
                data.email,
                hashedPassword,
                data.rol_id,
                data.nombre,
                data.apellido,
                data.prefijo_cedula || null,
                data.cedula || null,
                data.access_expiration || null,
                data.registered_by_user_id || null,
                data.enabled || 1
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
            // Verificar si el campo de password está presente y encriptarlo si es necesario
            if (fieldsToUpdate.hasOwnProperty('password')) {
                const hashedPassword = await bcrypt.hash(fieldsToUpdate.password, 10);
                fieldsToUpdate.password = hashedPassword;
            }

            const updateQuery = `
                UPDATE usuarios
                SET ${Object.keys(fieldsToUpdate).map(field => `${field} = ?`).join(', ')}
                WHERE id = ?
            `;

            console.log(updateQuery);
            const updateParams = [...Object.values(fieldsToUpdate), userId];
            console.log(updateParams);
            
            await executeQuery(process.env.DB_CONNECTION_ODBC, updateQuery, updateParams);
            console.log('Campos actualizados correctamente');
        } catch (error) {
            console.error('Error al actualizar los campos del usuario:', error);
            throw error;
        }
    }

    // Método estático para eliminar lógicamente un usuario por su ID
    static async delete(userId) {
        try {
            const updateQuery = 'UPDATE usuarios SET enabled = 0 WHERE id = ?';
            await executeQuery(process.env.DB_CONNECTION_ODBC, updateQuery, [userId]);
            console.log('Usuario eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar lógicamente el usuario:', error);
            throw error;
        }
    }

}
