//dbUtils.js
import odbc from 'odbc';

export async function executeQuery(DSN, query, params) {
  let connection;
  try {
    console.log("paso1: ");
    // Establece la conexión utilizando el DSN proporcionado
    connection = await odbc.connect(`DSN=wakalSL4_0;CHARSET=UTF8;`);
    console.log("paso2: ");
    // Ejecuta la consulta con los parámetros proporcionados
    const result = await connection.query(query, params);
    console.log("paso3: ");
    // Retorna el resultado de la consulta
    return result;
  } catch (error) {
    // Captura y maneja cualquier error que ocurra durante la ejecución de la consulta
    console.error('Error al ejecutar la consulta:', error);
    throw error; // Puedes decidir si quieres propagar el error o manejarlo aquí mismo
  } finally {
    // Cierra la conexión si está abierta
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('Error al cerrar la conexión:', error);
      }
    }
  }
}

export async function prepareQueryforClient(select, from, where = null) {
  let query = `
      SELECT ${select}
      FROM ${from}
  `;

  if (where !== null) {
      query += `WHERE ${where}`;
  }
  return query;
}


export async function validateConnection(DSN) {
  let connection;
  try {
      // Verificar si el DSN no es null
      if (!DSN) {
          console.error('DSN no proporcionado.');
          return false;
      }
      // Intenta establecer la conexión utilizando el DSN proporcionado
      connection = await odbc.connect(`DSN=${DSN}`);
      // Si no hay errores al conectar, devuelve true
      return true;
  } catch (error) {
      // Si ocurre algún error al conectar, devuelve false
      console.error('Error al validar la conexión:', error);
      return false;
  } finally {
      // Cierra la conexión si está abierta
      if (connection) {
          try {
              await connection.close();
          } catch (error) {
              console.error('Error al cerrar la conexión:', error);
          }
      }
  }
}

//Agregar valores adicionales de precio y montos al cliente domesa

export async function addPreciosDomesa(array, db) {
  const str_replace = (search, replace, subject) => {
      return subject.split(search).join(replace);
  };

  for (const item of array) {
      let queries = [];

      // Determinar la consulta basada en el tipo_documento
      if (item.tipo_documento === '1' || item.tipo_documento === '2') {
          queries.push(`SELECT Concepto, MONTO FROM TotalesFactura WHERE NROFACTT = '${item.numero_documento}'`);
      } else if (item.tipo_documento === '3') {
          queries.push(`SELECT Concepto, MONTO FROM TotalesCredito WHERE NRONCR = '${item.numero_documento}'`);
      }

      for (const query of queries) {
          let resultado = await executeQuery(db, query, []);

          for (const resTemp of resultado) {
              let tempConcepto = resTemp.Concepto;
              tempConcepto = str_replace('.', '', tempConcepto);
              tempConcepto = str_replace(' ', '', tempConcepto);
              tempConcepto = str_replace(',', '', tempConcepto);
              tempConcepto = str_replace('0', '', tempConcepto);
              tempConcepto = str_replace(':', '', tempConcepto);
              tempConcepto = str_replace('Bs', '', tempConcepto);
              tempConcepto = str_replace('BS', '', tempConcepto);

              if(item.tipo_documento == "1" || item.tipo_documento == "2" || item.tipo_documento == "4"){
                if(tempConcepto == "NETOAPAGAR"){
                  item["neto_pagar"] = resTemp.MONTO;
                  item["total_pagar"] = resTemp.MONTO;
                }

              }else if(item.tipo_documento == "3" || item.tipo_documento == "5"){
                if(tempConcepto == "TOTALNOTA"){
                  item["neto_pagar"] = resTemp.MONTO;
                }
              }

              if(tempConcepto == "BASEIMPONIBLE"){
                item["base_imponible"] = resTemp.MONTO;
              }
              if(tempConcepto == "IVA16%"){
                item["monto_iva"] = resTemp.MONTO;
              }
              if(tempConcepto == "TOTAL EXENTO"){
                item["monto_exento"] = resTemp.MONTO;
              }

              //item[tempConcepto] = resTemp.MONTO;
          }
      }
  }

  return array;
}

