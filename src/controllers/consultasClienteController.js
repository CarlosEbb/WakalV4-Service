import Cliente from '../models/cliente.js';
import User from '../models/user.js';
import ConsultasCliente from '../models/consultasCliente.js';
import { createJSONResponse } from '../utils/responseUtils.js';
import { createExcel } from '../utils/excelGenerator.js';
import { createPDF } from '../utils/pdfGenerator.js';
import { createFile } from '../utils/fileGenerator.js';

 // Datos de la tabla
 const html = `
 <table>
    <thead>
        <tr>
            <td colspan="2">1. INFORMACIÓN PERSONAL</td>
        </tr>
    </thead>
    <tbody>
        <tr>
           <td>Nombre y Apellido: {{nombre}} {{apellido}}</td>
           <td>Cédula: {{prefijo_cedula}}{{cedula}}</td>
        </tr>
        
         <tr>
            <td>Usuario: {{username}}</td>
            <td>Departamento: {{department}}</td>
         </tr>
         <tr>
            <td>Teléfono: {{cod_area}}-{{telefono}}</td>
            <td>Cargo: {{cargo}}</td>
         </tr>
         <tr>
            <td>Jurisdicción (Estado): {{jurisdiccion_estado}}</td>
            <td>Jurisdicción (Sector): {{jurisdiccion_sector}}</td>
         </tr>
         <tr>
            <td>Fecha de registro: {{created_at}}</td>
            <td>Fecha de Expiración de usuario: {{access_expiration}}</td>
         </tr>
    </tbody>
</table>

 `;
 const html2 = `
 <table>
<thead>
<tr>
<td rowspan="2">SERIE</td>
<td rowspan="2">CANTIDAD CTRL PRECOMPRADOS</td>
<td rowspan="2">FECHA  DE ASIGNACION PIE PAGINA</td>
<td rowspan="2">IDENT. NRO. </td>
<td colspan="2">RANGOS PIE DE PAGINA</td>
<td colspan="2">CANTIDAD CONTROL ASIGNADOS</td>
<td rowspan="2">CANTIDAD CTRL ASIGNADOS</td>
</tr>
<tr>
<tdhidden>4</tdhidden>
<td>NRO CTRL INICIO</td>
<td>NRO CTRL FINAL</td>
<td>NRO CTRL INICIO</td>
<td>NRO CTRL FINAL</td>
</tr>
</thead>
<tbody>
<tr>
<td>G</td>
<td>1,200</td>
<td>3/1/2024</td>
<td>0</td>
<td>17,046,451</td>
<td>17,047,650</td>
<td>17,046,451</td>
<td>17,046,460</td>
<td>10</td>
</tr>
<tr>
<td>F</td>
<td>1,000</td>
<td>3/1/2024</td>
<td>0</td>
<td>17,047,651</td>
<td>17,048,650</td>
<td>17,047,651</td>
<td>17,047,967</td>
<td>317</td>
</tr>
</tbody>
<tfoot>
<tr>
<td colspan="9">TOTALES</td>

</tr>
</tfoot>

</table>


   `;

      
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