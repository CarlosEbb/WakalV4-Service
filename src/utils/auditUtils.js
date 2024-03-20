//auditUtils.js
import { executeQuery } from './dbUtils.js';

export async function insertAuditoria(usuarioId, operacion, tablaAfectada, oldValues, newValues, ipCliente) {
    try {
        const query = `
            INSERT INTO auditorias (usuario_id, operacion, tabla_afectada, old_values, new_values, ip_cliente)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [usuarioId, operacion, tablaAfectada, oldValues, newValues, ipCliente];
        await executeQuery(process.env.DB_CONNECTION_ODBC, query, params);
        console.log('Auditoría registrada correctamente');
    } catch (error) {
        console.error('Error al insertar auditoría:', error);
        throw error;
    }
}
