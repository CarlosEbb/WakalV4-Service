import { executeQuery, prepareQueryforClient } from '../utils/dbUtils.js';
import { obtenerFechasDelMes, obtenerNombreDelMes, obtenerSemanasDelMes } from '../utils/tools.js';

export default class ConsultasCliente {
    constructor(cliente) {
        this.cliente = cliente;
    }

    async getTotalEmitidos() {
        let tabla = this.cliente.name_bd_table;
        let from = '';
        let meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        
        if (tabla.includes('{{Mes}}')) {
            let consultas = meses.map(mes => `select count(*) as t from ${tabla.replace('{{Mes}}', mes)}`);
            from = `(${consultas.join(' union all \n')}) as subquery`;
        } else {
            from = `(select count(*) as t from ${tabla}) as subquery`;
        }
        
        let query = await prepareQueryforClient("SUM(t) as total", from);
        let params = [];
        
        const result = await executeQuery(this.cliente.connections, query, params);
        
        return result[0];
    }
    

    async getTotalMes(year, month) {
        let nombreDelMes = obtenerNombreDelMes(month);
        
        let fechas = obtenerFechasDelMes(year, month, 'YYYY-MM-DD');

        let query = await prepareQueryforClient(
            "count(*) as total", 
            this.cliente.name_bd_table.replace('{{Mes}}', nombreDelMes), 
            this.cliente.name_bd_column_fecha_asignacion + " BETWEEN ? AND ?"
        );

        let params = [fechas.fechaInicial, fechas.fechaFinal];
        const result = await executeQuery(this.cliente.connections, query, params);

        return result[0];
    }

    async getTotalSemanal(year, month) {
        let params = [];
        let nombreDelMes = obtenerNombreDelMes(month);
        const semanasDelMes = obtenerSemanasDelMes(year, month);
        console.log(semanasDelMes);
        let query = "SELECT ";
       
        semanasDelMes.forEach(semana => {
          query += `SUM(CASE WHEN ${this.cliente.name_bd_column_fecha_asignacion} BETWEEN '${semana.inicio}' AND '${semana.fin}' THEN 1 ELSE 0 END) AS semana_${semana.inicio.replace(/-/g, '_')}, `;
        });
        query = query.slice(0, -2); // Eliminar los últimos dos caracteres
        query += ` FROM ${this.cliente.name_bd_table.replace('{{Mes}}', nombreDelMes)}`;

        const result = await executeQuery(this.cliente.connections, query, params);

        return result[0];
    }

    async getTotalCorreos() {
        return 1;
    }
    
}
