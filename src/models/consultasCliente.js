import { executeQuery, prepareQueryforClient } from '../utils/dbUtils.js';
import { obtenerFechasDelMes, obtenerNombreDelMes } from '../utils/tools.js';

export default class ConsultasCliente {
    constructor(cliente) {
        this.cliente = cliente;
    }

    async getTotalEmitidos() {

        let query = await prepareQueryforClient("count(*) as total", this.cliente.name_bd_table);

        let params = [];

        const result = await executeQuery(this.cliente.connections, query, params);
        
        return result[0];
    }

    async getTotalMes(year, month) {
        let nombreDelMes = obtenerNombreDelMes(month);
        
        let fechas = obtenerFechasDelMes(year, month, 'YYYY-MM-DD');
        if(this.cliente.name_bd_column_fecha_asignacion_format != "YYYY-MM-DD"){
            console.log('es diferente la fecha')
        }
        let query = await prepareQueryforClient(
            "count(*) as total", 
            this.cliente.name_bd_table.replace('{{Mes}}', nombreDelMes), 
            this.cliente.name_bd_column_fecha_asignacion + " BETWEEN ? AND ?"
        );

        let params = [fechas.fechaInicial, fechas.fechaFinal];
        console.log(query);
        console.log(params);
        const result = await executeQuery(this.cliente.connections, query, params);

        return result[0];
    }

    async getTotalCorreos() {
        return 1;
    }
    
}
