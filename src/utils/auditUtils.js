//auditUtils.js
import { executeQuery } from './dbUtils.js';

export async function insertAuditoria(usuarioId, rolId, ruta, method, body, ipCliente) {
    try {
        // Verificar si el string 'body' es mayor a 2000 caracteres
        if (body.length > 2000) {
            body = '{}'; // Establecer 'body' como un string vacío
        }

        const query = `
            INSERT INTO auditorias (usuario_id, rol_id, ruta, method, body, ip_cliente)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const params = [usuarioId, rolId, ruta, method, body, ipCliente];

        await executeQuery(process.env.DB_CONNECTION_ODBC, query, params);
        console.log('Auditoría registrada correctamente', ruta);
    } catch (error) {
        console.error('Error al insertar auditoría:', error);
        throw error;
    }
}
