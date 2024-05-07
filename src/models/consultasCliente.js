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
        let query = "SELECT ";
       
        semanasDelMes.forEach(semana => {
          query += `SUM(CASE WHEN ${this.cliente.name_bd_column_fecha_asignacion} BETWEEN '${semana.inicio}' AND '${semana.fin}' THEN 1 ELSE 0 END) AS '${semana.inicio.replace(year+"-"+month+"-",'')}~${semana.fin.replace(year+"-"+month+"-",'')}', `;
        });
        query = query.slice(0, -2); // Eliminar los últimos dos caracteres
        query += ` FROM ${this.cliente.name_bd_table.replace('{{Mes}}', nombreDelMes)}`;

        const result = await executeQuery(this.cliente.connections, query, params);

        return result[0];
    }

    async getTotalCorreos() {
        return 1;
    }

    async getDataBusqueda(queryParams) {
        let params = [];
        let whereClause = '';
        let tabla = this.cliente.name_bd_table;

        let numero_control;
        let numero_control_nameParamBD = this.cliente.name_bd_column_numero_control;
        let numero_control_nameString = "numero_control";

        let fecha_inicio;
        let fecha_final;
        let fecha_tipo;

        let fecha_emision_nameParamBD = this.cliente.name_bd_column_fecha_emision;
        let fecha_emision_nameString = "fecha_emision";

        let fecha_asignacion_nameParamBD = this.cliente.name_bd_column_fecha_asignacion;
        let fecha_asignacion_nameString = "fecha_asignacion";
        
        if(queryParams.numero_control){
            numero_control = Number(queryParams.numero_control.replace(/-/g, '').replace(/^0+/, ''));
            params.push(numero_control - 10); params.push(numero_control + 10);
            whereClause = `${numero_control_nameParamBD} BETWEEN ? AND ?`;
        }

        if(queryParams.tipo_fecha && queryParams.fecha_inicio && queryParams.fecha_final){
            fecha_inicio = queryParams.fecha_inicio;
            fecha_final = queryParams.fecha_final;
            fecha_tipo = queryParams.tipo_fecha;
            let fecha_selected;

            if(fecha_tipo == "emision"){
                fecha_selected = fecha_emision_nameParamBD;
            }else if(fecha_tipo == "asignacion"){
                fecha_selected = fecha_asignacion_nameParamBD;
            }

            params.push(fecha_inicio); params.push(fecha_final);
            whereClause = `${fecha_selected} BETWEEN ? AND ?`;
        }
    
        let query = `SELECT ${numero_control_nameParamBD} as ${numero_control_nameString},
                            ${fecha_emision_nameParamBD} as ${fecha_emision_nameString},
                            ${fecha_asignacion_nameParamBD} as ${fecha_asignacion_nameString}
                     FROM ${tabla}
                     WHERE ${whereClause}
                     ORDER BY ${numero_control_nameParamBD}`;
        console.log(query, params);
        const result = await executeQuery(this.cliente.connections, query, params);

        return result;
    }
    
    
    
}
