//dbUtils.js
import odbc from 'odbc';

export async function executeQuery(DSN, query, params) {
  let connection;
  try {
    // Establece la conexión utilizando el DSN proporcionado
    connection = await odbc.connect(`DSN=${DSN}`);

    // Ejecuta la consulta con los parámetros proporcionados
    const result = await connection.query(query, params);

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
  