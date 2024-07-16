import { executeQuery, prepareQueryforClient, addPreciosDomesa } from '../utils/dbUtils.js';
import { obtenerFechasDelMes, obtenerNombreDelMes, obtenerSemanasDelMes, codificar, obtenerNumeroMes } from '../utils/tools.js';

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
        let url_documento_anexos;
        let addSelect = '';

        if(this.cliente.is_prod == 1){
            url_documento = `'${this.cliente.url_prod}'`;
            url_documento_anexos = `'${this.cliente.url_prod_anexos}'`;
        }else{
            url_documento = `'${this.cliente.url_qa}'`;
            url_documento_anexos = `'${this.cliente.url_qa_anexos}'`;
        }
        
        if(this.cliente.name_bd_table_coletilla != null && (queryParams.numero_control || queryParams.numero_documento)){
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
        }else if(queryParams.fecha_inicio || queryParams.fecha_final){
           
            if (tabla.includes('{{Mes}}')) {
                tabla = tabla.replace('{{Mes}}', obtenerNombreDelMes(obtenerNumeroMes(queryParams.fecha_inicio)));
            }
        }

        let order = '';
        let page = 1;
        let limit = 10;
        let offset = (page - 1) * limit + 1;

        let numero_control;
        let numero_control_nameParamBD = this.cliente.name_bd_column_numero_control;
        let numero_control_nameString = "numero_control";

        let numero_documento;
        let numero_documento_nameParamBD = this.cliente.name_bd_column_numero_documento;
        let numero_documento_nameString = "numero_documento";

        let tipo_documento;
        let tipo_documento_nameParamBD = this.cliente.name_bd_column_tipo_documento;
        let tipo_documento_nameString = "tipo_documento";

        let serie;
        let serie_nameParamBD = this.cliente.name_bd_column_serie;
        let serie_nameString = "serie";

        let rif;
        let rif_nameParamBD = this.cliente.name_bd_column_rif;
        let rif_nameString = "rif";

        let correo_cliente_nameParamBD = this.cliente.name_bd_column_correo_cliente;
        let correo_cliente_nameString = "correo_cliente";

        let telefono_cliente_nameParamBD = this.cliente.name_bd_column_telefono_cliente;
        let telefono_cliente_nameString = "telefono_cliente";

        let razon_social;
        let razon_social_nameParamBD = this.cliente.name_bd_column_razon_social;
        let razon_social_nameString = "razon_social";

        let fecha_inicio;
        let fecha_final;
        let fecha_tipo;

        let fecha_emision_nameParamBD = this.cliente.name_bd_column_fecha_emision;
        let fecha_emision_nameString = "fecha_emision";

        let fecha_asignacion_nameParamBD = this.cliente.name_bd_column_fecha_asignacion;
        let fecha_asignacion_nameString = "fecha_asignacion";

        let encrypt_nameParamBD = this.cliente.name_bd_column_encrypt;
        let encrypt_nameString = "encrypt";

        let encrypt_others_nameParamBD = this.cliente.name_bd_column_encrypt_others;
        let encrypt_others_nameString = "encrypt_others";


        let codigo_operacion_nameParamBD = this.cliente.name_bd_column_codigo_operacion;
        if(codigo_operacion_nameParamBD == null){
            codigo_operacion_nameParamBD = this.cliente.name_bd_column_codigo_operacion_format;
        }
        let codigo_operacion_nameString = "codigo_operacion";

        let codigo_suscriptor;
        let codigo_suscriptor_nameParamBD = this.cliente.name_bd_column_codigo_suscriptor;
        let codigo_suscriptor_nameString = "codigo_suscriptor";

        let hora_emision_nameParamBD = this.cliente.name_bd_column_hora_emision;
        let hora_emision_nameString = "hora_emision";

        let tipo_war_nameParamBD = this.cliente.name_bd_column_tipo_war;
        let tipo_war_nameString = "tipo_war";


        let status_nameParamBD = this.cliente.name_bd_column_status;
        let status_nameString = "status";


        let motivo_anulacion_nameParamBD = this.cliente.name_bd_column_motivo_anulacion;
        let motivo_anulacion_nameString = "motivo_anulacion";


        let fecha_anulacion_nameParamBD = this.cliente.name_bd_column_fecha_anulacion;
        let fecha_anulacion_nameString = "fecha_anulacion";

        let hora_anulacion_nameParamBD = this.cliente.name_bd_column_hora_anulacion;
        let hora_anulacion_nameString = "hora_anulacion";

        let neto_pagar_nameParamBD = this.cliente.name_bd_column_neto_pagar;
        let neto_pagar_nameString = "neto_pagar";

        let igtf_nameParamBD = this.cliente.name_bd_column_igtf;
        let igtf_nameString = "igtf";

        let total_pagar_nameParamBD = this.cliente.name_bd_column_total_pagar;
        let total_pagar_nameString = "total_pagar";

        let base_imponible_nameParamBD = this.cliente.name_bd_column_base_imponible;
        let base_imponible_nameString = "base_imponible";

        let monto_iva_nameParamBD = this.cliente.name_bd_column_monto_iva;
        let monto_iva_nameString = "monto_iva";
        
        let monto_exento_nameParamBD = this.cliente.name_bd_column_monto_exento;
        let monto_exento_nameString = "monto_exento";
        
        let no_sujeto_nameParamBD = this.cliente.name_bd_column_monto_no_sujeto;
        let no_sujeto_nameString = "monto_no_sujeto";

        let anexos_nameParamBD = this.cliente.name_bd_column_anexos;
        let anexos_nameString = "anexos";


        if(queryParams.numero_control){
            numero_control = Number(queryParams.numero_control.replace(/-/g, '').replace(/^0+/, ''));
            let cantidad_mostrar = 10;
            if(queryParams.especifico_check){
                cantidad_mostrar = 0;
            }
            params.push(numero_control - cantidad_mostrar); 
            
            if(!queryParams.especifico_check){
                params.push(numero_control + cantidad_mostrar);
            }
            if (whereClause !== '') {
                whereClause += ' OR ';
            }

            if(queryParams.especifico_check){
                whereClause += `${numero_control_nameParamBD} = ?`;
            }else{
                whereClause += `${numero_control_nameParamBD} BETWEEN ? AND ?`;
            }
        }

        if(queryParams.numero_control){
            numero_control = Number(queryParams.numero_control.replace(/-/g, '').replace(/^0+/, ''));
            let cantidad_mostrar = 10;
            if(queryParams.especifico_check){
                cantidad_mostrar = 0;
            }
            params.push(numero_control - cantidad_mostrar); 
            
            if(!queryParams.especifico_check){
                params.push(numero_control + cantidad_mostrar);
            }
            if (whereClause !== '') {
                whereClause += ' OR ';
            }

            if(queryParams.especifico_check){
                whereClause += `${numero_control_nameParamBD} = ?`;
            }else{
                whereClause += `${numero_control_nameParamBD} BETWEEN ? AND ?`;
            }
        }

        if(queryParams.codigo_suscriptor){
            codigo_suscriptor = queryParams.codigo_suscriptor;
            
            params.push(codigo_suscriptor); 
            
            if (whereClause !== '') {
                whereClause += ' OR ';
            }

            whereClause += `${codigo_suscriptor_nameParamBD} = ?`;
        }
        
        if(queryParams.numero_documento){
            let hasLetters = /[a-zA-Z]/.test(queryParams.numero_documento);
            let hasHyphen = queryParams.numero_documento.includes('-');
            
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

                let cantidad_mostrar = 10;
                
                if(queryParams.especifico_check){
                    cantidad_mostrar = 0;
                }
                let inicio = numero - cantidad_mostrar; // inicio del rango
                let fin = numero + cantidad_mostrar; // fin del rango

                
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
                let cantidad_mostrar = 10;
                if(queryParams.especifico_check){
                    cantidad_mostrar = 0;
                }
                params.push(numero_documento - cantidad_mostrar); params.push(numero_documento + cantidad_mostrar);
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
            if (whereClause !== '') {
                whereClause += ' AND ';
            }
            whereClause += `${fecha_selected} BETWEEN ? AND ?`;
        }

        if (queryParams.tipo_documento && queryParams.tipo_documento != "all") {
            // Separar los valores por el carácter ';'
            const tipo_documento_values = queryParams.tipo_documento.split(';');
            
            // Agregar los valores al array de parámetros
            params.push(...tipo_documento_values);
            
            if (whereClause !== '') {
                whereClause += ' AND ';
            }
            
            // Construir la cláusula IN con el número correcto de placeholders
            const placeholders = tipo_documento_values.map(() => '?').join(',');
            whereClause += `${tipo_documento_nameParamBD} IN (${placeholders})`;
        }

        if (queryParams.serie && queryParams.serie != "all") {
            // Separar los valores por el carácter ';'
            const serie_values = queryParams.serie.split(';');
            
            // Agregar los valores al array de parámetros
            params.push(...serie_values);
            
            if (whereClause !== '') {
                whereClause += ' AND ';
            }
            
            // Construir la cláusula IN con el número correcto de placeholders
            const placeholders = serie_values.map(() => '?').join(',');
            whereClause += `${serie_nameParamBD} IN (${placeholders})`;
        }

        if (queryParams.rif) {
           
            const rif = queryParams.rif;
            
            // Crear un array para almacenar todos los formatos
            let allRifFormats = [];
        
  
            // Eliminar los guiones del valor original
            let rifSinGuiones = rif.replace(/-/g, '');
    
            // Generar los diferentes formatos
            let format1 = rif;
            let format2 = rifSinGuiones;
            let format3 = rifSinGuiones.slice(0, 1) + '-' + rifSinGuiones.slice(1);
            let format4 = rifSinGuiones.slice(0, 1) + '-' + rifSinGuiones.slice(1, -1) + '-' + rifSinGuiones.slice(-1);
            let format5 = rifSinGuiones.slice(0, -1) + '-' + rifSinGuiones.slice(-1);

            // Agregar todos los formatos al array
            allRifFormats.push(format1, format2, format3, format4, format5);
  
        
            // Agregar los valores al array de parámetros
            params.push(...allRifFormats);
        
            // Crear los placeholders_rif para la cláusula IN
            const placeholders_rif = allRifFormats.map(() => '?').join(', ');
        
            if (whereClause !== '') {
                whereClause += ' AND ';
            }
        
            // Construir la cláusula IN con el número correcto de placeholders
            whereClause += `${rif_nameParamBD} IN (${placeholders_rif})`;
        }
        

        if (queryParams.razon_social) {

            razon_social = queryParams.razon_social;
            
            // Agregar los valores al array de parámetros
            params.push(razon_social);
        
            if (whereClause !== '') {
                whereClause += ' AND ';
            }
        
            // Construir la cláusula IN con el número correcto de placeholders
            whereClause += `${razon_social_nameParamBD} = ?`;
        }
        
        
        if(this.cliente.name_bd_column_encrypt != null){
            addSelect += `${encrypt_nameParamBD} as ${encrypt_nameString},`;
        }else{
            addSelect += `'no_encrypt' as ${encrypt_nameString},`;
        }

        

        // Definir un array con los pares de nombres de parámetros y cadenas de texto correspondientes
        const columnas = [
            { paramBD: neto_pagar_nameParamBD, string: neto_pagar_nameString },
            { paramBD: igtf_nameParamBD, string: igtf_nameString },
            { paramBD: total_pagar_nameParamBD, string: total_pagar_nameString },
            { paramBD: base_imponible_nameParamBD, string: base_imponible_nameString },
            { paramBD: monto_iva_nameParamBD, string: monto_iva_nameString },
            { paramBD: monto_exento_nameParamBD, string: monto_exento_nameString },
            { paramBD: no_sujeto_nameParamBD, string: no_sujeto_nameString },
            { paramBD: encrypt_others_nameParamBD, string: encrypt_others_nameString },
            { paramBD: codigo_operacion_nameParamBD, string: codigo_operacion_nameString },
            { paramBD: serie_nameParamBD, string: serie_nameString },
            { paramBD: codigo_suscriptor_nameParamBD, string: codigo_suscriptor_nameString },
            { paramBD: hora_emision_nameParamBD, string: hora_emision_nameString },
            { paramBD: status_nameParamBD, string: status_nameString },
            { paramBD: motivo_anulacion_nameParamBD, string: motivo_anulacion_nameString },
            { paramBD: fecha_anulacion_nameParamBD, string: fecha_anulacion_nameString },
            { paramBD: hora_anulacion_nameParamBD, string: hora_anulacion_nameString },

            { paramBD: correo_cliente_nameParamBD, string: correo_cliente_nameString },
            { paramBD: telefono_cliente_nameParamBD, string: telefono_cliente_nameString },
            { paramBD: anexos_nameParamBD, string: anexos_nameString },
            { paramBD: tipo_war_nameParamBD, string: tipo_war_nameString },
        ];
        
        // Recorrer el array de columnas y construir la cadena addSelect
        columnas.forEach(columna => {
            if (columna.paramBD !== null) {
                addSelect += `${columna.paramBD} as ${columna.string},`;
            } else {
                addSelect += `'' as ${columna.string},`;
            }
        });

        //${url_documento} as url_documento

        if(queryParams.limit){
            limit = queryParams.limit
        }

        if(queryParams.offset){
            offset = queryParams.offset;
        }

        if(queryParams.order == "DESC"){
            order = "DESC";
        }

        if(queryParams.order == "ASC"){
            order = "ASC";
        }
        
        let query = `SELECT TOP ${limit} START AT ${offset}
                            ${numero_control_nameParamBD} as ${numero_control_nameString},
                            ${numero_documento_nameParamBD} as ${numero_documento_nameString},
                            ${fecha_emision_nameParamBD} as ${fecha_emision_nameString},
                            ${fecha_asignacion_nameParamBD} as ${fecha_asignacion_nameString},
                            ${rif_nameParamBD} as ${rif_nameString},
                            ${razon_social_nameParamBD} as ${razon_social_nameString},
                            ${addSelect}
                            ${tipo_documento_nameParamBD} as ${tipo_documento_nameString},
                            '${this.cliente.rif}' as rif_prestador
                     FROM ${tabla}
                     WHERE ${whereClause}
                     ORDER BY ${numero_control_nameParamBD} ${order}`;
        
        console.log(query, params);
        let result = await executeQuery(this.cliente.connections, query, params);
        if(this.cliente.id == 10){
            result = await addPreciosDomesa(result, this.cliente.connections);
        }
        return result;
    }
    
    
    
}