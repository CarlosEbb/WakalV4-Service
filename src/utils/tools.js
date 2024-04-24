import fs from 'fs';
import crypto from 'crypto';


export async function limpiarObjeto(obj) {
    Object.keys(obj).forEach(key => 
        (obj[key] === null || obj[key] === '') && delete obj[key]
      );
      return obj;
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
