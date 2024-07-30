import fs from 'fs';
import crypto from 'crypto';
import moment from 'moment';

export function limpiarObjeto(obj) {
    Object.keys(obj).forEach(key => 
        (obj[key] === null || obj[key] === '') && delete obj[key]
      );
      return obj;
}

export function obtenerNombreDelMes(numeroDelMes) {
    // Configurar moment.js para usar español
    moment.locale('es');

    // Crear una fecha con el número del mes
    let fecha = moment().month(numeroDelMes - 1);

    // Retornar el nombre del mes en español
    return fecha.format('MMMM');
}

export function obtenerNumeroMes(fecha) {
      // Crear un objeto Moment a partir de la fecha
      let fechaMoment = moment(fecha, 'YYYY-MM-DD');
    
      // Obtener el mes en formato numérico con dos dígitos (de 01 a 12)
      let mesNumerico = fechaMoment.format('MM');
  
      return mesNumerico;
}

export function obtenerFechasDelMes(year, mes, formato) {
    // Crear la fecha inicial del mes
    let fechaInicial = moment([year, mes - 1]);

    // Crear la fecha final del mes
    let fechaFinal = moment(fechaInicial).endOf('month');

    // Retornar las fechas en el formato deseado
    return {
        fechaInicial: fechaInicial.format(formato),
        fechaFinal: fechaFinal.format(formato)
    };
}

export function convertDateTime(dateTime,format) {
    // Establece el locale a español
    moment.locale('es');

    // Convertir la fecha y hora al formato deseado
    let convertedDateTime = moment(dateTime, 'YYYY-MM-DD HH:mm:ss.SSSS').format(format);

    return convertedDateTime;
}

export function saveImage(file) {
    const randomName = crypto.randomBytes(16).toString('hex');

    const oldPath = file.path;
    const newPath = oldPath.replace(file.filename, `${randomName}.jpg`);

    fs.renameSync(oldPath, newPath);

    return "/" + newPath.replace(/\\/g, '/');

}

export function deleteImage(file) {
    if (file !== undefined && file !== null) {
        let imagePath = file.path;
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error("Ocurrió un error al intentar eliminar la imagen: ", err);
            } else {
                console.log("Imagen eliminada exitosamente");
            }
        });
    }
}


// Función para obtener las semanas del mes
export function obtenerSemanasDelMes(year, month) {
    const fecha = new Date(year, month-1);
    const semanas = [];
    const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
  
    let inicioSemana = new Date(primerDia);
  
    
    while (inicioSemana <= ultimoDia) {
      let finSemana = new Date(inicioSemana);
      
      finSemana.setDate(inicioSemana.getDate() + (6 - inicioSemana.getDay()) + 1); // Obtener el próximo domingo
  
      if (finSemana > ultimoDia) {
        finSemana = ultimoDia;
      }
  
      semanas.push({
        inicio: inicioSemana.toISOString().split('T')[0],
        fin: finSemana.toISOString().split('T')[0]
      });
  
      inicioSemana.setDate(finSemana.getDate() + 1); // Avanzar al próximo día después del fin de semana
    }
  
    return semanas;
}

export function codificar(cadena) {
    let encriptado = "";
    let num = 0;
    const abecedario = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U",
        "V","W","X","Y","Z","1","2","3","4","5","6","7","8","9","0"];
    let valorRandom = 0;   

    for (let x = 0; x < cadena.length; x++) {
        num = Math.floor(Math.random() * 9) + 1; // número aleatorio entre 1 y 9
        encriptado += num.toString();

        for (let y = 0; y < num; y++) {
            valorRandom = Math.floor(Math.random() * 35); // valor aleatorio del arreglo abecedario
            encriptado += abecedario[valorRandom];
        }
        encriptado += cadena[x];
    }       

    return encriptado;       
}

export function buscarValorInArray(arr, value) {
    // Convierte value a string y elimina ceros iniciales
    let valor = value.toString().replace(/^0+/, '');

    for (var i = 0; i < arr.length; i++) {
        var subArray = arr[i];
        for (var j = 0; j < subArray.length; j++) {
            // Convierte cada elemento a string y elimina ceros iniciales antes de comparar
            if (subArray[j].toString().replace(/^0+/, '') === valor) {
                return { subArrayIndex: i, elementIndex: j }; // Devuelve la posición exacta
            }
        }
    }
    return null; // Devuelve null si el valor no se encuentra en ningún subarreglo
}

export function aplicarFormatoNrocontrol(numero, cant = 8) {
    let prefijo = 2;
    // Construir la expresión regular dinámicamente con la cantidad deseada de dígitos
    let regexStr = `^\\d{2}-\\d{${cant}}$`;
    let cadena = new RegExp(regexStr);
    
    if (cadena.test(numero)) {
        // Si ya tiene el formato correcto, devolver el número sin cambios
        return numero;
    } else {
        // Si no tiene el formato correcto, verificar y aplicar el formato
        var numeroSinGuiones = numero.replace(/-/g, ''); // Eliminar guiones si los hay

        // Verificar si el número tiene menos de la cantidad deseada de dígitos y rellenar con ceros si es necesario
        if (numeroSinGuiones.length < (prefijo+cant)) {
            var cerosFaltantes = '0'.repeat((prefijo+cant) - numeroSinGuiones.length);
            numeroSinGuiones = cerosFaltantes + numeroSinGuiones;
        }

        // Aplicar el formato
        var numeroFormateado = numeroSinGuiones.replace(new RegExp(`(\\d{2})(\\d{${cant}})`), '$1-$2');
        return numeroFormateado;
    }
}

export function replaceVariablesInHtml(html, variables) {
    return html.replace(/{{(.*?)}}/g, (_, key) => variables[key.trim()] || '');
};

