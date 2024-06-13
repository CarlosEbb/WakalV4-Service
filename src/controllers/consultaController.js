import Consulta from '../models/Consulta.js';
import Parametro from '../models/Parametro.js';
import ConsultaParametros from '../models/ConsultaParametros.js';
import { createJSONResponse } from '../utils/responseUtils.js';
import Cliente from '../models/cliente.js';
import User from '../models/user.js';
import { isTokenInvalid } from '../utils/tokenUtils.js';
import { buscarValorInArray, aplicarFormatoNrocontrol, codificar } from '../utils/tools.js';
import jwt from 'jsonwebtoken';

// Controlador para obtener todas las consultas de un cliente
export const getAllConsultasByCliente = async (req, res) => {
    try {
        // Obtener el ID del cliente desde la solicitud
        let cliente;
        const rol_id = req.user.rol_id;
        const clienteId = req.params.clienteId;
        if (rol_id === 1 || rol_id === 2) {
          cliente = await Cliente.findById(clienteId);
        } else {
          const user = await User.findById(req.user.id);
          cliente = await Cliente.findById(user.cliente_id);          
        }
        // Obtener todas las consultas del cliente
        const consultas = await Consulta.findByClienteId(cliente.id);

        // Verificar si se encontraron consultas
        if (consultas.length === 0) {
            const jsonResponse = createJSONResponse(404, 'Consultas', { errors: ['No se encontraron consultas para este cliente'] });
            return res.status(404).json(jsonResponse);
        }

        //Iterar sobre las consultas y obtener los parámetros asociados a cada una
        for (const consulta of consultas) {
            let dataParametros = await ConsultaParametros.findByTipoConsultaId(consulta.id);
            if(dataParametros[0]?.column_reference_cliente){
                cliente[dataParametros[0]?.column_reference_cliente];
                dataParametros[0].column_reference_cliente_value = JSON.parse(cliente[dataParametros[0]?.column_reference_cliente]);
            }
            consulta.parametros = dataParametros;
            
        }

        // Retornar las consultas con sus parámetros en el response
        const jsonResponse = createJSONResponse(200, 'Consultas obtenidas correctamente', consultas);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al obtener las consultas del cliente:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
};

export const getAllConsultasByClienteAndRol = async (req, res) => {
    try {
        let cliente;
        const rol_id = req.user.rol_id;
        const { clienteId, rolId } = req.params;
        let rol_final;


        if (rol_id === 1 || rol_id === 2) {
            cliente = await Cliente.findById(clienteId);
            rol_final = rolId;
        } else {
            const user = await User.findById(req.user.id);
            cliente = await Cliente.findById(user.cliente_id);
            rol_final = rol_id;
        }

        const consultas = await Consulta.findByClienteIdAndRolId(cliente.id, rol_final);

        if (consultas.length === 0) {
            const jsonResponse = createJSONResponse(404, 'Consultas', { errors: ['No se encontraron consultas para este cliente y rol'] });
            return res.status(404).json(jsonResponse);
        }

        for (const consulta of consultas) {
            let dataParametros = await ConsultaParametros.findByTipoConsultaId(consulta.id);
            if(dataParametros[0]?.column_reference_cliente){
                cliente[dataParametros[0]?.column_reference_cliente];
                dataParametros[0].column_reference_cliente_value = JSON.parse(cliente[dataParametros[0]?.column_reference_cliente]);
            }
            consulta.parametros = dataParametros;
        }

        const jsonResponse = createJSONResponse(200, 'Consultas obtenidas correctamente', consultas);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al obtener las consultas del cliente y rol:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
};


// Controlador para obtener todos los parametros de un cliente
export const getAllParametros = async (req, res) => {
    try {        
        // Obtener todas las consultas del cliente
        const parametros = await Parametro.getAll();
        

        // Retornar las consultas con sus parámetros en el response
        const jsonResponse = createJSONResponse(200, 'Parametros obtenidas correctamente', parametros);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al obtener los parametros del cliente:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
};

export const createConsultas = async (req, res) => {
    try {
        const { cliente_id } = req.params;
        console.log(req.body);
        const consultasByname = await Consulta.findByClienteIdAndName(cliente_id, req.body.nombre_consulta);

        // Validar si consultasByname no tiene ningún elemento
        if (consultasByname.length > 0) {
            const jsonResponse = createJSONResponse(400, 'Error', { errors: ['Ya existe una consulta con ese nombre para el cliente especificado.'] });
            return res.status(400).json(jsonResponse);
        }

        // Continuar con el flujo normal si no hay consultas con el mismo nombre
        const consultaId = await Consulta.create(cliente_id, req.body);
        
        // Retornar las consultas con sus parámetros en el response
        const jsonResponse = createJSONResponse(200, 'Consulta creada correctamente', { consultaId });
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al crear consulta: ', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
};

export const deleteConsultas = async (req, res) => {
    try {
        const consulta_id = req.params.id;
        await Consulta.delete(consulta_id);
        const jsonResponse = createJSONResponse(200, 'Consulta eliminada correctamente', {});
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al eliminar la consulta:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
};




export const getConsultasPDF = async (req, res) => {
    try {
        const { token, anexos} = req.query;
console.log(anexos);
        // Verificar si el token está en la lista de tokens inválidos
        const TokenInvalid = await isTokenInvalid(token);

        if (TokenInvalid) {
            // Si el token está en la lista de tokens inválidos, devolver un error
            const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: ['¡Ups! El token que has introducido no es válido o ya ha sido utilizado'] });
            return res.status(400).json(jsonResponse);
        }

        // Verificar si el token es válido
        jwt.verify(token, 'secretKey', async (err, decoded) => {
            if (err) {
                // Si el token no es válido, devolver un error de token inválido
                const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', { errors: ['¡Ups! El token que has introducido no es válido o ya ha sido utilizado'] });
                return res.status(400).json(jsonResponse);
            }

            // Obtener el ID del usuario del token decodificado
            const user_id = decoded.id;

            // Buscar al usuario por su ID
            const user = await User.findById(user_id);
            
            if (!user) {
                // Si el usuario no existe, devolver un error
                const jsonResponse = createJSONResponse(404, 'Datos de entrada no válidos', { errors: ['Usuario no encontrado'] });
                return res.status(404).json(jsonResponse);
            }

            let cliente;
            let url;
           
            const rol_id = decoded.rol_id;
            const cliente_id = req.params.cliente_id;
            if (rol_id === 1 || rol_id === 2) {
                cliente = await Cliente.findById(cliente_id);
            } else {
                cliente = await Cliente.findById(user.cliente_id);          
            }
            
            
            let array = JSON.parse(cliente.name_bd_column_tipo_documento_format).values;
            
            let tipo_view_pdf = req.params.tipo_documento;
            let control_view_pdf;
            let encrypt;
            let busqueda = buscarValorInArray(array, req.params.tipo_documento);
            if (busqueda != null) {
                if (cliente.name_bd_column_tipo_documento_view_pdf_format != null) {
                    let jsonParsed = JSON.parse(cliente.name_bd_column_tipo_documento_view_pdf_format);
                    tipo_view_pdf = jsonParsed[busqueda.subArrayIndex][busqueda.elementIndex];
                }
            }
            
            if(cliente.numero_control_view_pdf_format == 1){
                if(cliente.id == 2 ){
                    control_view_pdf = aplicarFormatoNrocontrol(req.params.numero_control,7);
                }else{
                    control_view_pdf = aplicarFormatoNrocontrol(req.params.numero_control);
                }
            }else{
                control_view_pdf = req.params.numero_control;
            }
            
          
            encrypt = cliente.encrypt_url_format_order;
            
            if(cliente.name_bd_column_encrypt != null){
                if(req.params.encrypt){
                    encrypt = req.params.encrypt;
                }
            }
            if(encrypt != null){

                encrypt = encrypt.replace("{{tipo_documento}}", (tipo_view_pdf ? tipo_view_pdf : ""));
                encrypt = encrypt.replace("{{numero_control}}", (control_view_pdf ? control_view_pdf : ""));
                encrypt = encrypt.replace("{{numero_documento}}", (req.params.numero_documento ? req.params.numero_documento : ""));
                encrypt = encrypt.replace("{{mes}}", (req.params.mes ? req.params.mes : ""));
    
                let funcionesAUsar = JSON.parse(cliente.encrypt_url_format);

                console.log(encrypt);
                if(funcionesAUsar != null){
                    funcionesAUsar.forEach(funcion => {
                        if (funcion === "base64") {
                            encrypt = btoa(encrypt);
                        } else if (funcion === "codificar") {
                            encrypt = codificar(encrypt);
                        }
                    });
                }
    
                if(cliente.is_prod == "1"){
                    if(anexos){
                        url = cliente.url_prod_anexos;
                    }else{
                        url = cliente.url_prod;
                    }
                }else{
                    if(anexos){
                        url = cliente.url_qa_anexos;
                    }else{
                        url = cliente.url_qa;
                    }
                }
               
                url = url.replace("{{encrypt}}", encrypt);
                
                if(req.query.encrypt_others){
                    url = url.replace("{{ruta_url}}", req.query.encrypt_others);
                }
                res.redirect(url);
            }else{
                const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error al contruir url PDF'] });
                return res.status(500).json(jsonResponse);
            }
        });

        
        
    } catch (error) {
        console.error('Error al obtener las consultas del cliente:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
};
