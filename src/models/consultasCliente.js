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

    async getDataBusqueda(queryParams, islimit = true) {
        let params = [];
        let whereClause = '';
        let tabla = this.cliente.name_bd_table;
        let addSelect = '';
        
        // Manejar coletilla si es necesario
        tabla = await this.handleColetilla(queryParams, tabla);
        
        // Reemplazar la plantilla del mes si es necesario
        tabla = this.replaceMesTemplate(queryParams, tabla);
        
        let order, limit, offset;
        if (islimit) {
            // Inicializar variables comunes
            ({ order, limit, offset } = this.initializePagination(queryParams));
        }
    
        // Agregar filtros al whereClause y params
        whereClause = this.addFilters(queryParams, params, whereClause);
        
        // Construir el select adicional
        addSelect = this.buildAdditionalSelect(queryParams);
    
        let totalCount = 0;

        if (islimit && offset == 1) {
            
            // Construir y ejecutar la consulta para el conteo
            const countQuery = this.buildQuery(tabla, whereClause, addSelect, limit, offset, order, true);
            let countResult = await executeQuery(this.cliente.connections, countQuery, params);
            totalCount = countResult[0]?.['COUNT()'] || 0;
        }
    
        // Construir y ejecutar la consulta para los datos
        const dataQuery = this.buildQuery(tabla, whereClause, addSelect, limit, offset, order, false);
        let dataResult = await executeQuery(this.cliente.connections, dataQuery, params);
    
        if (this.cliente.id == 10) {
            dataResult = await addPreciosDomesa(dataResult, this.cliente.connections);
        }
        
        return islimit ? { data: dataResult, totalCount: totalCount } : { data: dataResult };
    }
    
    
    // Función para configurar URLs basadas en el entorno
    setURLs(cliente) {
        if (cliente.is_prod == 1) {
            return {
                url_documento: `'${cliente.url_prod}'`,
                url_documento_anexos: `'${cliente.url_prod_anexos}'`
            };
        } else {
            return {
                url_documento: `'${cliente.url_qa}'`,
                url_documento_anexos: `'${cliente.url_qa_anexos}'`
            };
        }
    }
    
    // Función para manejar coletilla
    async handleColetilla(queryParams, tabla) {
        if (this.cliente.name_bd_table_coletilla != null && (queryParams.numero_control || queryParams.numero_documento)) {
            let { query_coletilla, params_coletilla } = this.buildColetillaQuery(queryParams);
            const result_coletilla = await executeQuery(this.cliente.connections, query_coletilla, params_coletilla);
            let data_coletilla = result_coletilla[0]?.numero_mes;
            if (!data_coletilla) {
                return null;
            }
            if (tabla.includes('{{Mes}}')) {
                tabla = tabla.replace('{{Mes}}', obtenerNombreDelMes(data_coletilla));
            }
        }
        return tabla;
    }
    
    // Función para reemplazar la plantilla del mes si es necesario
    replaceMesTemplate(queryParams, tabla) {
        if (queryParams.fecha_inicio || queryParams.fecha_final) {
            if (tabla.includes('{{Mes}}')) {
                tabla = tabla.replace('{{Mes}}', obtenerNombreDelMes(obtenerNumeroMes(queryParams.fecha_inicio)));
            }
        }
        return tabla;
    }
    
    // Función para inicializar la paginación
    initializePagination(queryParams) {
        let order = '';
        let limit = queryParams.limit || 10;
        let offset = queryParams.offset || 1;
    
        if (queryParams.order === "DESC") {
            order = "DESC";
        } else if (queryParams.order === "ASC") {
            order = "ASC";
        }
    
        return { order, limit, offset };
    }
    
    // Función para agregar filtros al whereClause y params
    addFilters(queryParams, params, whereClause) {
        // Agregar filtro para numero_control
        if (queryParams.numero_control) {
            whereClause = this.addNumeroControlFilter(queryParams, params, whereClause);
        }

        // Agregar filtro para control_inicial and control_final
        if (queryParams.control_inicial && queryParams.control_final) {
            whereClause = this.addControlNumberRangeFilter(queryParams, params, whereClause);
        }
    
        // Agregar filtro para codigo_suscriptor
        if (queryParams.codigo_suscriptor) {
            whereClause = this.addCodigoSuscriptorFilter(queryParams, params, whereClause);
        }
    
        // Agregar filtro para numero_documento
        if (queryParams.numero_documento) {
            whereClause = this.addNumeroDocumentoFilter(queryParams, params, whereClause);
        }

        // Agregar filtro para documento_inicial and documento_final
        if (queryParams.documento_inicial && queryParams.documento_final) {
            whereClause = this.addNumeroDocumentoRangeFilter(queryParams, params, whereClause);
        }

        // Agregar filtro para fechas
        if (queryParams.tipo_fecha && queryParams.fecha_inicio && queryParams.fecha_final) {
            whereClause = this.addFechaFilter(queryParams, params, whereClause);
        }
    
        // Agregar filtro para tipo_documento
        if (queryParams.tipo_documento && queryParams.tipo_documento !== "all") {
            whereClause = this.addTipoDocumentoFilter(queryParams, params, whereClause);
        }
    
        // Agregar filtro para serie
        if (queryParams.serie && queryParams.serie !== "all") {
            whereClause = this.addSerieFilter(queryParams, params, whereClause);
        }
    
        // Agregar filtro para rif
        if (queryParams.rif) {
            whereClause = this.addRifFilter(queryParams, params, whereClause);
        }
    
        // Agregar filtro para razon_social
        if (queryParams.razon_social) {
            whereClause = this.addRazonSocialFilter(queryParams, params, whereClause);
        }
    
        return whereClause;
    }
    
    // Función para construir el select adicional
    buildAdditionalSelect(queryParams) {
        let addSelect = ',';
        
        if(!queryParams.config_params){
            if (this.cliente.name_bd_column_encrypt != null) {
                addSelect += `${this.cliente.name_bd_column_encrypt} as encrypt,`;
            } else {
                addSelect += `'no_encrypt' as encrypt,`;
            }
        }
    
        const columnas = [
            { paramBD: this.cliente.name_bd_column_rif, string: "rif" },
            { paramBD: this.cliente.name_bd_column_neto_pagar, string: "neto_pagar" },
            { paramBD: this.cliente.name_bd_column_igtf, string: "igtf" },
            { paramBD: this.cliente.name_bd_column_total_pagar, string: "total_pagar" },
            { paramBD: this.cliente.name_bd_column_base_imponible, string: "base_imponible" },
            { paramBD: this.cliente.name_bd_column_monto_iva, string: "monto_iva" },
            { paramBD: this.cliente.name_bd_column_monto_exento, string: "monto_exento" },
            { paramBD: this.cliente.name_bd_column_monto_no_sujeto, string: "monto_no_sujeto" },
            { paramBD: this.cliente.name_bd_column_encrypt_others, string: "encrypt_others" },
            { paramBD: this.cliente.name_bd_column_codigo_operacion, string: "codigo_operacion" },
            { paramBD: this.cliente.name_bd_column_serie, string: "serie" },
            { paramBD: this.cliente.name_bd_column_codigo_suscriptor, string: "codigo_suscriptor" },
            { paramBD: this.cliente.name_bd_column_hora_emision, string: "hora_emision" },
            { paramBD: this.cliente.name_bd_column_status, string: "status" },
            { paramBD: this.cliente.name_bd_column_motivo_anulacion, string: "motivo_anulacion" },
            { paramBD: this.cliente.name_bd_column_fecha_anulacion, string: "fecha_anulacion" },
            { paramBD: this.cliente.name_bd_column_hora_anulacion, string: "hora_anulacion" },
            { paramBD: this.cliente.name_bd_column_correo_cliente, string: "correo_cliente" },
            { paramBD: this.cliente.name_bd_column_telefono_cliente, string: "telefono_cliente" },
            { paramBD: this.cliente.name_bd_column_razon_social, string: "razon_social" },
            { paramBD: this.cliente.name_bd_column_anexos, string: "anexos" },
            { paramBD: this.cliente.name_bd_column_tipo_war, string: "tipo_war" },
            { paramBD: `'${this.cliente.rif}'`, string: "rif_prestador" },

        ];
        
        // Filtrar columnas basadas en queryParams.config_params si está presente
        const columnasFiltradas = queryParams.config_params
            ? columnas.filter(columna => queryParams.config_params.includes(columna.string))
            : columnas;
    
        //console.log(queryParams.config_params);

        columnasFiltradas.forEach(columna => {
            if (columna.paramBD !== null) {
                addSelect += `${columna.paramBD} as ${columna.string},`;
            } else {
                addSelect += `'' as ${columna.string},`;
            }
        });

         // Quitar el último carácter si es una coma
        if (addSelect.endsWith(',')) {
            addSelect = addSelect.slice(0, -1);
        }
    
        return addSelect;
    }
    
    // Función para construir la consulta
    buildQuery(tabla, whereClause, addSelect, limit = null, offset = null, order = 'ASC', isCount = false) {
        if (isCount) {
            return `SELECT COUNT(*)
                    FROM ${tabla}
                    WHERE ${whereClause}`;
        }
    
        let limitOffsetClause = '';
        let limitOffsetClauseString = '';
        let offsetSQL = offset;
        if (limit !== null && offset !== null) {
            if(offset != 1){
                limitOffsetClauseString = `START AT ${offsetSQL}`;
            }
            limitOffsetClause = `TOP ${limit} ${limitOffsetClauseString}`;
        }
    
        return `SELECT ${limitOffsetClause}
                    ROW_NUMBER() OVER (ORDER BY ${this.cliente.name_bd_column_numero_control}) AS Nro,
                    ${this.cliente.name_bd_column_numero_control} as numero_control,
                    ${this.cliente.name_bd_column_numero_documento} as numero_documento,
                    ${this.cliente.name_bd_column_tipo_documento} as tipo_documento,
                    ${this.cliente.name_bd_column_fecha_emision} as fecha_emision,
                    ${this.cliente.name_bd_column_fecha_asignacion} as fecha_asignacion
                    ${addSelect}
                FROM ${tabla}
                WHERE ${whereClause}
                ORDER BY ${this.cliente.name_bd_column_numero_control} ${order}`;
    }
    
    buildColetillaQuery(queryParams) {
        let params_coletilla = [];
        let query_coletilla = `SELECT numero_mes FROM ${this.cliente.name_bd_table_coletilla} WHERE 1=1`;
    
        if (queryParams.numero_control) {
            let numero_control = Number(queryParams.numero_control.replace(/-/g, '').replace(/^0+/, ''));
            query_coletilla += ` AND ${this.cliente.name_bd_column_numero_control} = ?`;
            params_coletilla.push(numero_control);
        }
    
        if (queryParams.numero_documento) {
            let numero_documento = queryParams.numero_documento;
            query_coletilla += ` AND ${this.cliente.name_bd_column_numero_documento} = ?`;
            params_coletilla.push(numero_documento);
        }
    
        return { query_coletilla, params_coletilla };
    }

    //funciones para filtrar

    addNumeroControlFilter(queryParams, params, whereClause) {
        let numero_control = Number(queryParams.numero_control.replace(/-/g, '').replace(/^0+/, ''));
        let cantidad_mostrar = queryParams.especifico_check ? 0 : 10;
        
        params.push(numero_control - cantidad_mostrar);
        
        if (!queryParams.especifico_check) {
            params.push(numero_control + cantidad_mostrar);
        }
        
        if (whereClause !== '') {
            whereClause += ' OR ';
        }
    
        if (queryParams.especifico_check) {
            whereClause += `${this.cliente.name_bd_column_numero_control} = ?`;
        } else {
            whereClause += `${this.cliente.name_bd_column_numero_control} BETWEEN ? AND ?`;
        }
        
        return whereClause;
    }

    addControlNumberRangeFilter(queryParams, params, whereClause) {
        const control_inicial = Number(queryParams.control_inicial.replace(/-/g, '').replace(/^0+/, ''));
        const control_final = Number(queryParams.control_final.replace(/-/g, '').replace(/^0+/, ''));    
    
        // Añadir los valores inicial y final al array de parámetros
        params.push(control_inicial, control_final);
    
        // Verificar si el whereClause no está vacío para agregar 'OR'
        if (whereClause !== '') {
            whereClause += ' OR ';
        }
    
        // Añadir la condición de rango al whereClause
        whereClause += `${this.cliente.name_bd_column_numero_control} BETWEEN ? AND ?`;
        
        return whereClause;
    }
    
    addCodigoSuscriptorFilter(queryParams, params, whereClause) {
        params.push(queryParams.codigo_suscriptor);
        
        if (whereClause !== '') {
            whereClause += ' OR ';
        }
    
        whereClause += `${this.cliente.name_bd_column_codigo_suscriptor} = ?`;
        
        return whereClause;
    }
    
    addNumeroDocumentoFilter(queryParams, params, whereClause) {
        let numero_documento = queryParams.numero_documento;
        let hasLetters = /[a-zA-Z]/.test(numero_documento);
        let hasHyphen = numero_documento.includes('-');
        
        if (hasLetters || hasHyphen || this.cliente.id === 4) {
            let partes = numero_documento.split('-');
            let prefijo = partes[0];
            let numero = parseInt(partes[1] || partes[0]);
            let digitos = (partes[1] || partes[0]).length;
            let cantidad_mostrar = queryParams.especifico_check ? 0 : 10;
            let inicio = numero - cantidad_mostrar;
            let fin = numero + cantidad_mostrar;
    
            params = [];
            for (let i = inicio; i <= fin; i++) {
                let doc = prefijo + '-' + String(i).padStart(digitos, '0');
                params.push(doc);
            }
    
            let placeholders = params.map(() => '?').join(',');
    
            if (whereClause !== '') {
                whereClause += ' OR ';
            }
            whereClause += `${this.cliente.name_bd_column_numero_documento} IN (${placeholders})`;
        } else {
            let numero = Number(numero_documento.replace(/-/g, '').replace(/^0+/, ''));
            let cantidad_mostrar = queryParams.especifico_check ? 0 : 10;
    
            params.push(numero - cantidad_mostrar);
            params.push(numero + cantidad_mostrar);
    
            if (whereClause !== '') {
                whereClause += ' OR ';
            }
            whereClause += `${this.cliente.name_bd_column_numero_documento} BETWEEN ? AND ?`;
        }
        
        return whereClause;
    }

    addNumeroDocumentoRangeFilter(queryParams, params, whereClause) {
        let documento_inicial = queryParams.documento_inicial;
        let documento_final = queryParams.documento_final;
    
        let hasLettersInicial = /[a-zA-Z]/.test(documento_inicial);
        let hasLettersFinal = /[a-zA-Z]/.test(documento_final);
        let hasHyphenInicial = documento_inicial.includes('-');
        let hasHyphenFinal = documento_final.includes('-');
    
        if ((hasLettersInicial && hasLettersFinal) || (hasHyphenInicial && hasHyphenFinal) || this.cliente.id === 4) {
            let partesInicial = documento_inicial.split('-');
            let partesFinal = documento_final.split('-');
    
            let prefijoInicial = partesInicial[0];
            let prefijoFinal = partesFinal[0];
            let numeroInicial = parseInt(partesInicial[1] || partesInicial[0]);
            let numeroFinal = parseInt(partesFinal[1] || partesFinal[0]);
    
            let digitosInicial = (partesInicial[1] || partesInicial[0]).length;
            let digitosFinal = (partesFinal[1] || partesFinal[0]).length;
            
            params = [];
            for (let i = numeroInicial; i <= numeroFinal; i++) {
                let doc = prefijoInicial + '-' + String(i).padStart(digitosInicial, '0');
                params.push(doc);
            }
    
            let placeholders = params.map(() => '?').join(',');
    
            if (whereClause !== '') {
                whereClause += ' OR ';
            }
            whereClause += `${this.cliente.name_bd_column_numero_documento} IN (${placeholders})`;
        } else {
            let numeroInicial = Number(documento_inicial.replace(/-/g, '').replace(/^0+/, ''));
            let numeroFinal = Number(documento_final.replace(/-/g, '').replace(/^0+/, ''));
    
            params.push(numeroInicial);
            params.push(numeroFinal);
    
            if (whereClause !== '') {
                whereClause += ' OR ';
            }
            whereClause += `${this.cliente.name_bd_column_numero_documento} BETWEEN ? AND ?`;
        }
        
        return whereClause;
    }    
    
    addFechaFilter(queryParams, params, whereClause) {
        let fecha_selected;
        if (queryParams.tipo_fecha === "emision") {
            fecha_selected = this.cliente.name_bd_column_fecha_emision;
        } else if (queryParams.tipo_fecha === "asignacion") {
            fecha_selected = this.cliente.name_bd_column_fecha_asignacion;
        }
    
        params.push(queryParams.fecha_inicio);
        params.push(queryParams.fecha_final);
    
        if (whereClause !== '') {
            whereClause += ' AND ';
        }
        whereClause += `${fecha_selected} BETWEEN ? AND ?`;
        
        return whereClause;
    }
    
    addTipoDocumentoFilter(queryParams, params, whereClause) {
        let tipo_documento_values = queryParams.tipo_documento.split(';');
        params.push(...tipo_documento_values);
        
        if (whereClause !== '') {
            whereClause += ' AND ';
        }
    
        let placeholders = tipo_documento_values.map(() => '?').join(',');
        whereClause += `${this.cliente.name_bd_column_tipo_documento} IN (${placeholders})`;
        
        return whereClause;
    }
    
    addSerieFilter(queryParams, params, whereClause) {
        let serie_values = queryParams.serie.split(';');
        params.push(...serie_values);
        
        if (whereClause !== '') {
            whereClause += ' AND ';
        }
    
        let placeholders = serie_values.map(() => '?').join(',');
        whereClause += `${this.cliente.name_bd_column_serie} IN (${placeholders})`;
        
        return whereClause;
    }
    
    addRifFilter(queryParams, params, whereClause) {
        let rif = queryParams.rif;
        let rifSinGuiones = rif.replace(/-/g, '');
    
        let allRifFormats = [
            rif,
            rifSinGuiones,
            rifSinGuiones.slice(0, 1) + '-' + rifSinGuiones.slice(1),
            rifSinGuiones.slice(0, 1) + '-' + rifSinGuiones.slice(1, -1) + '-' + rifSinGuiones.slice(-1),
            rifSinGuiones.slice(0, -1) + '-' + rifSinGuiones.slice(-1)
        ];
    
        params.push(...allRifFormats);
        let placeholders_rif = allRifFormats.map(() => '?').join(', ');
    
        if (whereClause !== '') {
            whereClause += ' AND ';
        }
    
        whereClause += `${this.cliente.name_bd_column_rif} IN (${placeholders_rif})`;
        
        return whereClause;
    }
    
    addRazonSocialFilter(queryParams, params, whereClause) {
        params.push(queryParams.razon_social);
    
        if (whereClause !== '') {
            whereClause += ' AND ';
        }
    
        whereClause += `${this.cliente.name_bd_column_razon_social} = ?`;
        
        return whereClause;
    }
    
    
    
}
