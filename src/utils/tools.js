export async function limpiarObjeto(obj) {
    Object.keys(obj).forEach(key => 
        (obj[key] === null || obj[key] === '') && delete obj[key]
      );
      return obj;
}