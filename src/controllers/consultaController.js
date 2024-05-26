import Consulta from '../models/Consulta.js';
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

export const getConsultasPDF = async (req, res) => {
    try {
        const { token } = req.query;
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
            if(busqueda != null){
                if(cliente.name_bd_column_tipo_documento_view_pdf_format != null){
                    tipo_view_pdf = JSON.parse(cliente.name_bd_column_tipo_documento_view_pdf_format)[busqueda];
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
                    url = cliente.url_prod;
                }else{
                    url = cliente.url_qa;
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
