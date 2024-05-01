//auditUtils.js
import { executeQuery } from './dbUtils.js';

export async function insertAuditoria(usuarioId, rolId, ruta, method, body, ipCliente) {
    try {
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
