import Cliente from '../models/cliente.js';
import User from '../models/user.js';
import ConsultasCliente from '../models/consultasCliente.js';
import { createJSONResponse } from '../utils/responseUtils.js';
import { createExcel } from '../utils/excelGenerator.js';
import { createPDF } from '../utils/pdfGenerator.js';
import { createFile } from '../utils/fileGenerator.js';
import { replaceVariablesInHtml } from '../utils/tools.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
      
let content = {
columns: ['columna 1', 'columna 2', 'columna 3'],
body: [
['contenido 1', 'contenido 2', 'contenido 3'],
['contenido 1', 'contenido 2', 'contenido 3'],
['contenido 1', 'contenido 2', 'contenido 3'],
],
}; 

// Método para obtener todos los documentos emitidos desde origen
export const getTotalEmitidos = async (req, res) => {
    try {
        let cliente;
        const rol_id = req.user.rol_id;
        const cliente_id = req.params.cliente_id;
        if (rol_id === 1 || rol_id === 2) {
          cliente = await Cliente.findById(cliente_id);
        } else {
          const user = await User.findById(req.user.id);
          cliente = await Cliente.findById(user.cliente_id);          
        }

        const consulta = new ConsultasCliente(cliente);
        const totalEmitidos = await consulta.getTotalEmitidos();

        const jsonResponse = createJSONResponse(200, 'Totales emitidos obtenidos correctamente', totalEmitidos);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al obtener Totales Emitidos:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
};

//metodo para obtener el total de documentos emitidos en un mes en especifico
export const getTotalMes = async (req, res) => {
    try {

        let cliente;
        const rol_id = req.user.rol_id;
        const cliente_id = req.params.cliente_id;
        if (rol_id === 1 || rol_id === 2) {
          cliente = await Cliente.findById(cliente_id);
        } else {
          const user = await User.findById(req.user.id);
          cliente = await Cliente.findById(user.cliente_id);          
        }



        const consulta = new ConsultasCliente(cliente);
        const totalEmitidos = await consulta.getTotalMes(req.params.year, req.params.month);

        const jsonResponse = createJSONResponse(200, 'Totales emitidos por mes obtenidos correctamente', totalEmitidos);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al obtener Totales Emitidos:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
};

//metodo para obtener total emitidos por mes, separado por semanas
export const getTotalEmitidosSemanal = async (req, res) => {
    try {
        let cliente;
        const rol_id = req.user.rol_id;
        const cliente_id = req.params.cliente_id;
        if (rol_id === 1 || rol_id === 2) {
          cliente = await Cliente.findById(cliente_id);
        } else {
          const user = await User.findById(req.user.id);
          cliente = await Cliente.findById(user.cliente_id);          
        }

        const consulta = new ConsultasCliente(cliente);
        const totalEmitidosSemanal = await consulta.getTotalSemanal(req.params.year, req.params.month);

        const jsonResponse = createJSONResponse(200, 'Totales semanales emitidos obtenidos correctamente', totalEmitidosSemanal);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        console.error('Error al obtener Totales Emitidos:', error);
        const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
        return res.status(500).json(jsonResponse);
    }
};


//metodo para obtener data de las busquedas dinamicas
export const getDataBusqueda = async (req, res) => {
  try {
      let cliente;
      const rol_id = req.user.rol_id;
      const cliente_id = req.params.cliente_id;
      if (rol_id === 1 || rol_id === 2) {
        cliente = await Cliente.findById(cliente_id);
      } else {
        const user = await User.findById(req.user.id);
        cliente = await Cliente.findById(user.cliente_id);          
      }

      const consulta = new ConsultasCliente(cliente);
      const { data, totalCount } = await consulta.getDataBusqueda(req.query);
      const jsonResponse = createJSONResponse(200, 'Busqueda obtenida correctamente', data, { totalCount });
      return res.status(200).json(jsonResponse);
  } catch (error) {
      console.error('Error al obtener Busqueda:', error);
      const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
      return res.status(500).json(jsonResponse);
  }
};

//metodo para obtener data de los reportes
export const getDataReporte = async (req, res) => {
  try {
      let cliente;
      //const rol_id = 1;
      //const cliente_id = 1;
      const rol_id = req.user.rol_id;
      const cliente_id = req.body.c;
      
      if (rol_id === 1 || rol_id === 2) {
        cliente = await Cliente.findById(cliente_id);
      } else {
        const user = await User.findById(req.user.id);
        cliente = await Cliente.findById(user.cliente_id);          
      }
      const consulta = new ConsultasCliente(cliente);
      const { data } = await consulta.getDataBusqueda(req.body, false);

      const tipo_reporte = req.body.tipo_reporte;
     
      const fechaInicio = req.body.fecha_inicio;
      const fechaFinal = req.body.fecha_final;
      const rangoFechas = `${fechaInicio} - ${fechaFinal}`;
     
      const alltittle = {
          'libro_ventas': `Libro de Ventas ${rangoFechas}`,
          'archivo_retorno': "Archivo Retorno"
      };
      
      const config = {
        titulo: alltittle[tipo_reporte] ?? '',
        subtitulo: `${cliente.nombre_cliente}, RIF ${cliente.rif}`,
        logo: "../public/img/logo.jpg",
        pageOrientation: "Landscape",
        config_params: JSON.parse(req.body.name_config_params),
      };
      console.log(req.body.name_config_params);
      const filename = config.titulo ? config.titulo.replace(/\s+/g, '_') : 'reporte';

      if(req.body.formato == 'excel'){
        // Generar Excel
        const workbook = await createExcel(data, config);
        // respuesta de descarga
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
      }else  if (req.body.formato === 'csv' || req.body.formato === 'txt' || req.body.formato === 'xml') {
        // Generar archivo (CSV, TXT o XML)
        const fileBuffer = await createFile(data, req.body.formato);
  
        // Establecer encabezados y enviar el archivo
        let contentType;
        if (req.body.formato === 'csv') {
          contentType = 'text/csv';
        } else if (req.body.formato === 'txt') {
          contentType = 'text/plain';
        } else if (req.body.formato === 'xml') {
          contentType = 'application/xml';
        }
  
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.${req.body.formato}"`);
        res.send(fileBuffer);
      }else{
       // Generar PDF
        const pdfBuffer = await createPDF(data, config);
    
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
        res.end(pdfBuffer, 'binary');
      }
      


       
  } catch (error) {
      console.error('Error al obtener Reporte:', error);
      const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
      return res.status(500).json(jsonResponse);
  }
};

export const getDataReporteImprenta = async (req, res) => {
  try {
    const config = {
      titulo: 'Reporte Mensual Providencia 0032 Art.28',
      subtitulo: '',
      logo: "../public/img/banner_reporte.jpg",
      pageOrientation: "Landscape",
      table:{
        widths: ['5%', '35%', '8%', '8%', '5%', '10%', '10%', '9%', '*']
      }
    };

    const htmlFilePath = path.resolve(__dirname, '../views/Reports/Reporteprov0032.html');
    const html = fs.readFileSync(htmlFilePath, 'utf8');

    const plantilla = `
      <tr>
          <td>{{nro}}</td>
          <td>{{contribuyente}}</td>
          <td>{{rif}}</td>
          <td>{{fecha_asignacion}}</td>
          <td>{{serie}}</td>
          <td>{{numero_control_inicial}}</td>
          <td>{{numero_control_final}}</td>
          <td>{{cantidad}}</td>
          <td>{{numero_factura}}</td>
      </tr>
    `;

    const clientes = await Cliente.getAll();

    // Variable para almacenar los tiempos de respuesta
    const tiemposDeRespuesta = [];
    const mesConsulta = '2024-07';
    const fechaConsulta = new Date('2024-07-01');

    //faltan

      
      //cliente.id == 20 || //inter
    
      //cliente.id == 15 || //fibex
      //cestatiket tiene serie pero es consecutivo


    // Utilizamos Promise.all para ejecutar las consultas de forma concurrente
    const resultados = await Promise.all(clientes.map(async (cliente, index) => {
      if(cliente.date_enabled == null){
        const consulta = new ConsultasCliente(new Cliente(cliente));
        const inicio = Date.now(); // Tiempo de inicio de la petición
        const { data } = await consulta.getDataBusqueda({ mes: mesConsulta }, false, true);
        const fin = Date.now(); // Tiempo de fin de la petición

        let filasHTML = '';
        let numero_control_inicial, numero_control_final, cantidad, fecha_asignacion, serie;

        // Calcular el tiempo que tomó la petición
        const tiempoDeRespuesta = fin - inicio;
        tiemposDeRespuesta.push(tiempoDeRespuesta);

        console.log(`Tiempo de respuesta para ${cliente.nombre_cliente}: ${tiempoDeRespuesta}ms`);
        
        if(cliente.name_bd_custom_query_prov0032_mes != null && cliente.name_bd_column_serie_format != null){
          // Recorrer la data por serie
          data.forEach((item, serieIndex) => {
            numero_control_inicial = item.numero_control_inicial;
            numero_control_final = item.numero_control_final;
            if(item.cantidadNumerosControl){
              cantidad = item.cantidadNumerosControl;
            }else{
              cantidad = (numero_control_final - numero_control_inicial) + 1;
            }
            fecha_asignacion = item.fecha_asignacion;
            serie = item.serie;

            filasHTML += replaceVariablesInHtml(plantilla, {
              nro: `${index + 1}.${serieIndex + 1}`, // Para diferenciar las filas de series
              contribuyente: cliente.nombre_cliente,
              rif: cliente.rif,
              fecha_asignacion: fecha_asignacion,
              serie: serie,
              numero_control_inicial: numero_control_inicial,
              numero_control_final: numero_control_final,
              cantidad: cantidad,
              numero_factura: ''
            });
          });
        } else {
          numero_control_inicial = data[0].numero_control;
          numero_control_final = data[1].numero_control;
          cantidad = numero_control_final - numero_control_inicial + 1;
          fecha_asignacion = data[0].fecha_asignacion;
          serie = 'N/A';

          filasHTML = replaceVariablesInHtml(plantilla, {
            nro: index + 1,
            contribuyente: cliente.nombre_cliente,
            rif: cliente.rif,
            fecha_asignacion: fecha_asignacion,
            serie: serie,
            numero_control_inicial: numero_control_inicial,
            numero_control_final: numero_control_final,
            cantidad: cantidad,
            numero_factura: ''
          });
        }

        return filasHTML;
      }
    }));

    // Unimos todos los contenidos generados
    const contenido = resultados.filter(Boolean).join('');

    
    const htmlWithUserData = replaceVariablesInHtml(html, { contenido: contenido });
    
    const filename = config.titulo ? config.titulo.replace(/\s+/g, '_') : 'reporte';
    const pdfBuffer = await createPDF(htmlWithUserData, config);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    res.end(pdfBuffer, 'binary');

    // Mostrar todos los tiempos de respuesta en la consola (opcional)
    console.log('Tiempos de respuesta:', tiemposDeRespuesta);
  } catch (error) {
    console.error('Error al obtener Reporte:', error);
    const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
    return res.status(500).json(jsonResponse);
  }
};



     

export const generateDataPDFHTML = async (req, res) => {
  try {
    let cliente;
    const rol_id = req.user.rol_id;
    const cliente_id = req.params.cliente_id;
    if (rol_id === 1 || rol_id === 2) {
      cliente = await Cliente.findById(cliente_id);
    } else {
      const user = await User.findById(req.user.id);
      cliente = await Cliente.findById(user.cliente_id);          
    }
    
    // Obtener los datos de la tabla del cuerpo de la solicitud
    const tableData = req.body.tableData;
    if (!tableData) {
      return res.status(400).json({ error: 'Los datos de la tabla son requeridos.' });
    }

    // Configuración del PDF
    const config = {
      titulo: 'REPORTE',
      subtitulo: `${cliente.nombre_cliente} RIF ${cliente.rif}`,
      logo: "../public/img/banner_reporte.jpg",
      pageOrientation: "Landscape",
    };

    const filename = config.titulo ? config.titulo.replace(/\s+/g, '_') : 'reporte';
    
    const pdfBuffer = await createPDF(tableData, config);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
    res.end(pdfBuffer, 'binary');
  } catch (error) {
    console.error('Error al generar reporte en PDF:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const generateDataExcelHTML = async (req, res) => {
  try {
    let cliente;
    const rol_id = req.user.rol_id;
    const cliente_id = req.params.cliente_id;
    if (rol_id === 1 || rol_id === 2) {
      cliente = await Cliente.findById(cliente_id);
    } else {
      const user = await User.findById(req.user.id);
      cliente = await Cliente.findById(user.cliente_id);          
    }

    // Obtener los datos de la tabla del cuerpo de la solicitud
    const tableData = req.body.tableData;
    if (!tableData) {
      return res.status(400).json({ error: 'Los datos de la tabla son requeridos.' });
    }
    
      // Generar Excel
      const config = {
        titulo: 'REPORTE',
        subtitulo: `${cliente.nombre_cliente} RIF ${cliente.rif}`,
        logo: "../public/img/logo.jpg",
      }
      const filename = config.titulo ? config.titulo.replace(/\s+/g, '_') : 'reporte';
      const workbook = await createExcel(tableData, config);
      // respuesta de descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();

      //return res.status(200).json({});

  } catch (error) {
      console.error('Error al generar reporte en excel:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
  }
};


export const getDataExcel = async (req, res) => {
  try {
      // Generar Excel
      const config = {
       
      }
      const filename = config.titulo ? config.titulo.replace(/\s+/g, '_') : 'reporte';
      const workbook = await createExcel(html, config);
      // respuesta de descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();

      //return res.status(200).json({});

  } catch (error) {
      console.error('Error al generar reporte en excel:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getDataPDF = async (req, res) => {
  try {
    const config = {
      titulo: 'Reporte Detallado Nros. de Control Asignados Providencia 0032 Art.28',
      subtitulo: 'NESTLE VENEZUELA, S.A RIF J-000129266',
      tituloAdicional: 'Total Numeros de Controles Asignados: 20',
      tituloAdicional2: "Factura 4456",
      logo: "../public/img/banner_reporte.jpg",
      //pageOrientation: "Landscape",
    };

    const filename = config.titulo ? config.titulo.replace(/\s+/g, '_') : 'reporte';
    const pdfBuffer = await createPDF(html, config);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    res.end(pdfBuffer, 'binary');
  } catch (error) {
    console.error('Error al generar reporte en PDF:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};