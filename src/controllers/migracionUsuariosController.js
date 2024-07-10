import Cliente from '../models/cliente.js';
import UserCliente from '../models/userCliente.js';
import User from '../models/user.js';

import { createJSONResponse } from '../utils/responseUtils.js';
import { executeQuery } from '../utils/dbUtils.js';
// import { limpiarObjeto, saveImage, deleteImage } from '../utils/tools.js';


export const migrate = async (req, res) => {
    try {
        if (req.body.rif != null) {
            let cliente = await Cliente.findByRif(req.body.rif);

            // Obtenemos usuarios de la BD del cliente
            let usuariosClientes = await getAllUsuariosClientes(cliente.connections)


            let usuariosMigrados = [];
            let errorMigrarUsuarios = [];
            // toca insertar cada usuario en la tabla usuarios del wakal, y ese usuarios debe guardarse en la tabla usuarios_cliente
            for (let index = 0; index < usuariosClientes.length; index++) {
                // console.log(usuariosClientes[index]);
                let ced = usuariosClientes[index].ced;
                let tipo_doc;
                let doc;
                if (ced) {
                    tipo_doc = usuariosClientes[index].ced.substring(0, 1);
                    doc = usuariosClientes[index].ced.substring(1);
                } else {
                    tipo_doc = "";
                    doc = "";
                }
                const usuario = {
                    email: usuariosClientes[index].correo,
                    password: usuariosClientes[index].clave,
                    rol_id: usuariosClientes[index].groups_id,
                    nombre: usuariosClientes[index].nombre || "",
                    apellido: usuariosClientes[index].Apellido || "",
                    prefijo_cedula: tipo_doc,
                    cedula: doc,
                    email_alternativo: usuariosClientes[index].correo,
                    department: usuariosClientes[index].depa,
                    username: usuariosClientes[index].usuario,
                    // id cliente
                    cliente_id: cliente.id
                }
                let usuarioNew = await createUsuario({ body: usuario });
                if (usuarioNew.code == 200) {
                    usuariosMigrados.push(usuarioNew);
                } else {
                    errorMigrarUsuarios.push(usuarioNew);
                }
            }
            const jsonResponse = createJSONResponse(200, `Migrados correctamente ${usuariosMigrados.length} de ${usuariosClientes.length}`,
                {
                    usuariosMigrados,
                    errorMigrarUsuarios
                });
            return res.status(200).json(jsonResponse);
        }
    } catch (error) {
        console.error('Error al obtener todos los usuarios:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
}

// Motodo para crear un nuevo usuario
const createUsuario = async (req, res) => {
    try {
        // const registered_by_user_id = req.user.id; // Obtener el ID del usuario que inició sesión desde el token
        const newUserId = await User.create(req.body);

        //vincular a cliente existente
        await UserCliente.create({ "user_id": newUserId, "cliente_id": req.body.cliente_id })

        const jsonResponse = createJSONResponse(200, 'Usuario creado correctamente', { userId: newUserId });
        return jsonResponse;
    } catch (error) {
        console.error('Error al crear un nuevo usuario:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return jsonResponse;
    }
};


// Método para obtener todos los usuarios que no han sido eliminados lógicamente
const getAllUsuariosClientes = async (DB_CONNECTION_ODBC) => {
    let query = `SELECT * FROM usuario where groups_id=1 or groups_id=2 or groups_id=3;`;
    let params = [];
    const result = await executeQuery(DB_CONNECTION_ODBC, query, params);
    return result;
}