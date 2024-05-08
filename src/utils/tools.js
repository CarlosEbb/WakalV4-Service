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
