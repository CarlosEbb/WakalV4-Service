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
