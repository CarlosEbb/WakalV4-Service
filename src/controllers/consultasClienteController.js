import Cliente from '../models/cliente.js';
import User from '../models/user.js';
import ConsultasCliente from '../models/consultasCliente.js';
import { createJSONResponse } from '../utils/responseUtils.js';
import { createExcel} from '../utils/excelGenerator.js';
import { createPDF} from '../utils/pdfGenerator.js';
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


//metodo para obtener total emitidos por mes, separado por semanas
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
      const dataControl = await consulta.getDataBusqueda(req.query);

      const jsonResponse = createJSONResponse(200, 'Nro control obtenido correctamente', dataControl);
      return res.status(200).json(jsonResponse);
  } catch (error) {
      console.error('Error al obtener Nro control:', error);
      const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
      return res.status(500).json(jsonResponse);
  }
};


      // Datos de la tabla
      const html = `
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
      pageOrientation: "Landscape",
      
    }
    const filename = config.titulo ? config.titulo.replace(/\s+/g, '_') : 'reporte';
    const pdfBuffer = await createPDF(content , config);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
    res.end(pdfBuffer, 'binary');
  } catch (error) {
    console.error('Error al generar reporte en PDF:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};