// user.js (modelo de usuario)

import { executeQuery } from '../utils/dbUtils.js';
import bcrypt from 'bcrypt';
import moment from 'moment';

export default class User {
    #password; // Propiedad privada

    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.email = data.email;
        this.email_alternativo = data.email_alternativo;
        this.#password = data.password;
        this.rol_id = data.rol_id;
        this.nombre_rol = data.nombre_rol;
        this.nombre = data.nombre;
        this.apellido = data.apellido;
        this.prefijo_cedula = data.prefijo_cedula;
        this.cedula = data.cedula;
        this.department = data.department;
        this.img_profile = data.img_profile;
        this.access_expiration = data.access_expiration;
        this.ultima_conexion = data.ultima_conexion;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.registered_by_user_id = data.registered_by_user_id;
        this.enabled = data.enabled;
        this.telefono = data.telefono;
        this.jurisdiccion_estado = data.jurisdiccion_estado;
        this.jurisdiccion_region = data.jurisdiccion_region;
        this.jurisdiccion_sector = data.jurisdiccion_sector;
        this.cargo = data.cargo;
        this.cod_area = data.cod_area;
        this.is_tour = data.is_tour;
        this.failed_attempts = data.failed_attempts;
        
        if(data.rol_id == 3){
            this.cliente_id = data.cliente_id;
            this.rif = data.rif;
            this.nombre_cliente = data.nombre_cliente;
            this.logo = data.logo;
            this.rif = data.rif;
            //this.connections = data.connections;
        }

    }

    getPassword() {
        return this.#password;
    }

    // Método estático para buscar un usuario por su ID que no haya sido eliminado lógicamente
    static async findById(userId) {
        const query = `
            SELECT u.*, r.nombre AS nombre_rol, c.*, c.id as cliente_id,  u.id as id, u.enabled as enabled, u.created_at as created_at, u.updated_at as updated_at
            FROM usuarios u
            LEFT JOIN roles r ON u.rol_id = r.id
            LEFT JOIN usuarios_clientes uc ON u.id = uc.user_id
            LEFT JOIN clientes c ON uc.cliente_id = c.id
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
    static async findByEmailOrUsername(email) {
        const query = `
            SELECT u.*, r.nombre AS nombre_rol, c.*, c.id as cliente_id,  u.id as id, u.enabled as enabled, u.created_at as created_at, u.updated_at as updated_at
            FROM usuarios u
            LEFT JOIN roles r ON u.rol_id = r.id
            LEFT JOIN usuarios_clientes uc ON u.id = uc.user_id
            LEFT JOIN clientes c ON uc.cliente_id = c.id
            WHERE (u.email = ? OR u.email_alternativo = ? OR u.username = ?) AND u.enabled = 1
        `;
        const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, [email, email, email]);
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
            return hashedPassword;
        } catch (error) {
            console.error('Error al actualizar la contraseña del usuario:', error);
            throw error;
        }
    }

    // Método para obtener todos los usuarios que no han sido eliminados lógicamente
    static async getAll(user = null) {
            let query = `
                SELECT u.*, r.nombre AS nombre_rol
                FROM usuarios u
                LEFT JOIN roles r ON u.rol_id = r.id
                WHERE u.enabled = 1
            `;
            let params = [];
    
            if (user !== null) {
                query += ' AND u.rol_id = ? AND registered_by_user_id = ?';
                params.push(user.rol_id);
                params.push(user.id);
            }

            query += ' order by u.id';

            const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, params);
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

    static async usernameExists(username) {
        try {
            const query = `
                SELECT id, enabled
                FROM usuarios
                WHERE username = ?;
            `;
            const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, [username]);
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
            console.error('Error al verificar si el username existe:', error);
            throw error;
        }
    }

    // Método estático para crear un usuario
    static async create(data) {
        try {
            const insertQuery = `
                BEGIN
                    INSERT INTO usuarios (email, password, rol_id, nombre, apellido, prefijo_cedula, cedula, access_expiration, registered_by_user_id, enabled, email_alternativo, img_profile, department, username, telefono, jurisdiccion_estado, jurisdiccion_region, jurisdiccion_sector, cargo, cod_area)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                    SELECT @@IDENTITY AS 'ID';
                END;
            `;
            
            // Hashear la contraseña antes de almacenarla en la base de datos
            const hashedPassword = await bcrypt.hash(data.password, 10);
    
            const diasExpiracion = parseInt(process.env.ACCESS_EXPIRATION_DAYS, 10);
            const fechaExpiracion = moment().add(diasExpiracion, 'days').format('YYYY-MM-DD');

            const insertParams = [
                data.email,
                hashedPassword,
                data.rol_id,
                data.nombre,
                data.apellido,
                data.prefijo_cedula,
                data.cedula,
                data.access_expiration || fechaExpiracion,
                data.registered_by_user_id || null,
                data.enabled || 1,
                data.email_alternativo,
                data.img_profile || null,
                data.department || null,
                data.username,
                data.telefono || null,
                data.jurisdiccion_estado || null,
                data.jurisdiccion_region || null,
                data.jurisdiccion_sector || null,
                data.cargo || null,
                data.cod_area || null,
            ];
            
            const result = await executeQuery(process.env.DB_CONNECTION_ODBC, insertQuery, insertParams);
            console.log('Usuario creado correctamente');
            return String(result[0].ID); // Retorna el ID del nuevo usuario creado
        } catch (error) {
            console.error('Error al crear un nuevo usuario:', error);
            throw error;
        }
    }
    

    // Método estático para actualizar múltiples campos de un usuario por su ID
    static async updateFields(userId, fieldsToUpdate) {
        delete fieldsToUpdate.newPassword;
        let hashedPassword = null;
        try {
            // Verificar si el campo de password está presente y encriptarlo si es necesario
            if (Object.prototype.hasOwnProperty.call(fieldsToUpdate, 'password')) {
                hashedPassword = await bcrypt.hash(fieldsToUpdate.password, 10);
                fieldsToUpdate.password = hashedPassword;
    
                // Restablecer failed_attempts a 0 y actualizar access_expiration
                fieldsToUpdate.failed_attempts = 0;
                const expirationDays = parseInt(process.env.ACCESS_EXPIRATION_DAYS);
                fieldsToUpdate.access_expiration = moment().add(expirationDays, 'days').format('YYYY-MM-DD');
            }
    
            const updateQuery = `
                UPDATE usuarios
                SET ${Object.keys(fieldsToUpdate).map(field => `${field} = ?`).join(', ')}
                WHERE id = ?
            `;
            const updateParams = [...Object.values(fieldsToUpdate), userId];
            
            await executeQuery(process.env.DB_CONNECTION_ODBC, updateQuery, updateParams);
            console.log('Campos actualizados correctamente');

            
            return hashedPassword;
            
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
