import Cliente from '../models/cliente.js';
import { createJSONResponse } from '../utils/responseUtils.js';
import { executeQuery } from '../utils/dbUtils.js';
import moment from 'moment';
import Joi from 'joi';

async function getInfoTotalesSemanales(cliente, nombreMes, semanasDelMes) {
    let rif_mostrar = cliente.rif; //empresa.key_empresa.replace("_DB1", "").replace("_DB2", "").replace("_DB3", "");
    
    if (cliente.connections != null) {

        let consulta = "SELECT '"+ rif_mostrar +"' AS rif, '" + cliente.nombre_cliente + "' as nombre, ";
        let convert;
        if (cliente.name_bd_column_fecha_asignacion_format === "yyyy-mm-dd") {
            convert = cliente.name_bd_column_fecha_asignacion;
        } else if (cliente.name_bd_column_fecha_asignacion_format === "dd-mm-yyyy") {
            convert = "CONVERT(date, " + cliente.name_bd_column_fecha_asignacion + ", 104)";
        } else { // es dd/mm/yyyy
            convert = "CONVERT(date, " + cliente.name_bd_column_fecha_asignacion + ", 103)";
        }

      
        semanasDelMes.forEach(semana => {
            consulta += "SUM(CASE WHEN " + convert + " BETWEEN '" + semana.inicio + "' AND '" + semana.fin + "' THEN 1 ELSE 0 END) AS semana_" + semana.inicio.replace(/-/g, '_') + ", ";
        });
        
        consulta = consulta.slice(0, -2); // Eliminar los últimos dos caracteres
        consulta += " FROM " + procesarConsultaMes(cliente.name_bd_table, nombreMes);

        const result = await executeQuery(cliente.connections, consulta, []);

        result.forEach(objeto => {
            // Recorrer las propiedades de cada objeto
            for (let clave in objeto) {
              // Verificar si el valor es null y reemplazarlo con 0
              if (objeto[clave] === null) {
                objeto[clave] = 0;
              }
            }
        });
        
        return result;
        
        /*
            for (const bkey in arrayEmpresas[bEmpresa]) {
                if (bkey.includes('semana_')) {
                    arrayEmpresas[bEmpresa][bkey] += array[0][bkey];
                }
            }

            const bEmpresa = buscarSubcadenaEnArreglo(arrayEmpresas, 'J-00012926-6');
            if (bEmpresa != null) {
            
            } else {
                if (array[0]['semana_2024_03_01'] !== undefined && empresa.key_empresa === "J-30259700-5") {
                    array[0]['semana_2024_03_01'] = 341262;
                }
                arrayEmpresas[empresa.key_empresa] = array[0];
            }
        */
    } else {
        const objeto = {};
        objeto["rif"] = rif_mostrar;
        objeto['nombre'] = cliente.nombre_cliente;
        semanasDelMes.forEach(semana => {
            objeto['semana_' + semana.fin] = 0;
        });
        
        return [objeto];
    }
    
    //countTempo++;
}

// Definir el esquema de validación con Joi para la creación de clientes
export const validateTotalesSemanales = Joi.object({
    fecha: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
});
 
export const validateClienteId = Joi.number().integer().positive().required();

export const totalesSemanales = async (req, res) => {
    let clientes;
   
    try {
        // Validar la fecha del cuerpo de la solicitud
        const { error } = validateTotalesSemanales.validate(req.body);
        if (error) {
            // Si hay un error de validación, retornar un error de solicitud inválida
            const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: [error.details[0].message] });
            return res.status(400).json(jsonResponse);
        }
        
        if (typeof req.params.id !== 'undefined') {
            clientes = [await Cliente.findById(req.params.id)]; // Envolver el cliente en un array
        }else{
            clientes = await Cliente.getAll();
        }

        const fecha = req.body.fecha;
       
        const nombreMes = new Date(fecha).toLocaleString('es-ES', { month: 'long' });

        const semanasDelMes = await obtenerSemanasDelMes(fecha);
       
        const arrayEmpresasPromesas = clientes.map(cliente => getInfoTotalesSemanales(cliente, nombreMes, semanasDelMes)); // Crear un array de promesas
        
        // Esperar a que todas las promesas se resuelvan o rechacen
        const arrayEmpresas = await Promise.all(arrayEmpresasPromesas);

        const jsonResponse = createJSONResponse(200, 'Datos obtenidos correctamente', arrayEmpresas);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
};

// Función para buscar una subcadena en un arreglo
function buscarSubcadenaEnArreglo(arreglo, subcadena) {
    // Variable para almacenar el índice donde se encontró la subcadena
    let indiceEncontrado = null;

    // Iterar sobre las claves del arreglo
    for (let clave in arreglo) {
        // Verificar si la clave contiene la subcadena
        if (clave.includes(subcadena)) {
            // Guardar el índice donde se encontró la subcadena
            indiceEncontrado = clave;
            break; // Detener la iteración si se encuentra la subcadena en alguna clave
        }
    }
    // Devolver el índice donde se encontró la subcadena
    return indiceEncontrado;
}

function obtenerSemanasDelMes(fecha) {
    let semanas = [];
    let inicioMes = moment(fecha).startOf('month');
    let finMes = moment(fecha).endOf('month');
    
    let inicioSemana = moment(inicioMes).startOf('week');
    let finSemana = moment(inicioSemana).endOf('week').add(1, 'day'); // Ajuste para que la semana termine el domingo
    
    while (inicioSemana.isBefore(finMes)) {
        let inicio = inicioSemana.isBefore(inicioMes) ? inicioMes.format('YYYY-MM-DD') : inicioSemana.format('YYYY-MM-DD');
        let fin = finSemana.isAfter(finMes) ? finMes.format('YYYY-MM-DD') : finSemana.format('YYYY-MM-DD');
        semanas.push({ inicio, fin });
        inicioSemana = moment(finSemana).startOf('day').add(1, 'day'); // Comenzar desde el día siguiente al fin de la semana anterior
        finSemana = moment(inicioSemana).endOf('week').add(1, 'day'); // Ajuste para que la semana termine el domingo
    }
    
    return semanas;
}




function procesarConsultaMes(sql, mes) {
    let consulta = sql;
    consulta = consulta.replace('{{Mes}}', mes);
    return consulta;
}