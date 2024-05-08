import { executeQuery, prepareQueryforClient } from '../utils/dbUtils.js';
import { obtenerFechasDelMes, obtenerNombreDelMes, obtenerSemanasDelMes, codificar } from '../utils/tools.js';

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
        let url_documento;
        let encrypt;

        // const clave = codificar('FACT00-00192253');
        // const encrypt = Buffer.from(clave).toString('base64');
        if(this.cliente.is_prod == 1){
            url_documento = `'${this.cliente.url_prod}'`;
        }else{
            url_documento = `'${this.cliente.url_qa}'`;
        }
        
        if(this.cliente.name_bd_table_coletilla != null){
            let params_coletilla = [];
            let queryPart = '';
            if (queryParams.numero_control) {
                params_coletilla.push(queryParams.numero_control);
                queryPart = `? BETWEEN rangoInicial AND rangoFinal`;
            }
        
            if (queryParams.numero_documento) {
                if (queryPart !== '') {
                    queryPart += ' OR ';
                }
                params_coletilla.push(queryParams.numero_documento);
                params_coletilla.push(queryParams.numero_documento);
                params_coletilla.push(queryParams.numero_documento);
                queryPart += `? BETWEEN rangoInicalFac AND rangoFinalFac OR `;
                queryPart += `? BETWEEN rangoInicalNC AND rangoFinalNC OR `;
                queryPart += `? BETWEEN rangoInicalND AND rangoFinalND`;
            }

            let query_coletilla = `
                SELECT 
                    mesCarga as numero_mes
                FROM coletilla
                ${queryPart !== '' ? 'WHERE ' + queryPart : ''}
            `;

            const result_coletilla = await executeQuery(this.cliente.connections, query_coletilla, params_coletilla);
            let data_coletilla = result_coletilla[0]?.numero_mes;
            if(!data_coletilla){
                return null;
            }
            if (tabla.includes('{{Mes}}')) {
                tabla = tabla.replace('{{Mes}}',obtenerNombreDelMes(data_coletilla));
            }
        }

        let numero_control;
        let numero_control_nameParamBD = this.cliente.name_bd_column_numero_control;
        let numero_control_nameString = "numero_control";

        let numero_documento;
        let numero_documento_nameParamBD = this.cliente.name_bd_column_numero_documento;
        let numero_documento_nameString = "numero_documento";

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
            if (whereClause !== '') {
                whereClause += ' OR ';
            }
            whereClause += `${numero_control_nameParamBD} BETWEEN ? AND ?`;
        }
        if(queryParams.numero_documento){
            let hasLetters = /[a-zA-Z]/.test(queryParams.numero_documento);
            let hasHyphen = queryParams.numero_documento.includes('-');
            console.log(hasLetters || hasHyphen || this.cliente.id == 4);
            if(hasLetters || hasHyphen || this.cliente.id == 4){//si contiene letras
                let simbolo = '-'; 

                numero_documento = queryParams.numero_documento;
                let partes = numero_documento.split(simbolo); // separa el prefijo y la parte numérica
                
                
                if(!partes[1]){
                    partes[1] = partes[0];
                    partes[0] = "";
                    simbolo = "";
                }
                
                let prefijo = partes[0];
                let numero = parseInt(partes[1]);

                let digitos = partes[1].length; // obtiene la cantidad de dígitos

                let inicio = numero - 10; // inicio del rango
                let fin = numero + 10; // fin del rango

                // Limpia params y agrega todos los valores en el rango al array
                params = [];
                for (let i = inicio; i <= fin; i++) {
                    let doc = prefijo + simbolo + String(i).padStart(digitos, '0');
                    params.push(doc);
                }

                // Genera los signos de interrogación para la cláusula IN
                let placeholders = params.map(() => '?').join(',');

                // Construye la cláusula WHERE
                if (whereClause !== '') {
                    whereClause += ' OR ';
                }
                whereClause += `${numero_documento_nameParamBD} IN (${placeholders})`;

            }else{//solo son numeros
                numero_documento = Number(queryParams.numero_documento.replace(/-/g, '').replace(/^0+/, ''));
                params.push(numero_documento - 10); params.push(numero_documento + 10);
                if (whereClause !== '') {
                    whereClause += ' OR ';
                }
                whereClause += `${numero_documento_nameParamBD} BETWEEN ? AND ?`;
            }
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
                            ${numero_documento_nameParamBD} as ${numero_documento_nameString},
                            ${fecha_emision_nameParamBD} as ${fecha_emision_nameString},
                            ${fecha_asignacion_nameParamBD} as ${fecha_asignacion_nameString},
                            ${url_documento} as url_documento
                     FROM ${tabla}
                     WHERE ${whereClause}
                     ORDER BY ${numero_control_nameParamBD}`;
        console.log(query, params);
        
        const result = await executeQuery(this.cliente.connections, query, params);

        return result;
    }
    
    
    
}
