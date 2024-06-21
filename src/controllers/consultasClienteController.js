import Cliente from '../models/cliente.js';
import User from '../models/user.js';
import ConsultasCliente from '../models/consultasCliente.js';
import { createJSONResponse } from '../utils/responseUtils.js';
import { createExcel} from '../utils/pdfGenerator.js';
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

export const getDataPDF = async (req, res) => {
  try {
      // Datos de la tabla
      const html = `
                <table border="1">
   <thead>
      <tr class="row0">
        <td class="column0 style1 s style5" rowspan="2">SERIE</td>
        <td class="column1 style2 s style6" rowspan="2">CANTIDAD CTRL PRECOMPRADOS</td>
        <td class="column2 style2 s style6" rowspan="2">FECHA  DE ASIGNACION PIE PAGINA</td>
        <td class="column3 style2 s style6" rowspan="2">IDENT. NRO. </td>
        <td class="column4 style3 s style4" colspan="2">RANGOS PIE DE PAGINA</td>
        <td class="column6 style3 s style4" colspan="2">CANTIDAD CONTROL ASIGNADOS</td>
        <td class="column8 style2 s style6" rowspan="2">CANTIDAD CTRL ASIGNADOS</td>
      </tr>

      <tr class="row1">
        <td class="column4 style7 s">NRO CTRL INICIO</td>
        <td class="column5 style7 s">NRO CTRL FINAL</td>
        <td class="column6 style8 s">NRO CTRL INICIO</td>
        <td class="column7 style8 s">NRO CTRL FINAL</td>
      </tr>
    </thead>
    <tbody>
      <tr class="row18">
        <td class="column0 style9 s">G</td>
        <td class="column1 style9 n">1,200</td>
        <td class="column2 style10 n">3/1/2024</td>
        <td class="column3 style9 s">0</td>
        <td class="column4 style9 f">17,046,451</td>
        <td class="column5 style9 f">17,047,650</td>
        <td class="column6 style9 f">17,046,451</td>
        <td class="column7 style9 n">17,046,460</td>
        <td class="column8 style9 f">10</td>
      </tr>
      <tr class="row19">
        <td class="column0 style9 s">F</td>
        <td class="column1 style9 n">1,000</td>
        <td class="column2 style10 n">3/1/2024</td>
        <td class="column3 style9 s">0</td>
        <td class="column4 style9 f">17,047,651</td>
        <td class="column5 style9 f">17,048,650</td>
        <td class="column6 style9 f">17,047,651</td>
        <td class="column7 style9 n">17,047,967</td>
        <td class="column8 style9 f">317</td>
      </tr>
      <tr class="row20">
        <td class="column0 style11 null"></td>
        <td class="column1 style12 null"></td>
        <td class="column2 style13 null"></td>
        <td class="column3 style11 null"></td>
        <td class="column4 style11 null"></td>
        <td class="column5 style11 null"></td>
        <td class="column6 style11 null"></td>
        <td class="column7 style11 null"></td>
        <td class="column8 style9 null"></td>
      </tr>
    </tbody>
    <tfoot>
      <tr class="row21">
        <td class="column0 style14 s">TOTALES</td>
        <td class="column1 style15 f">383,700</td>
        <td class="column2 style14 null"></td>
        <td class="column3 style16 null"></td>
        <td class="column4 style16 null"></td>
        <td class="column5 style16 null"></td>
        <td class="column6 style16 null"></td>
        <td class="column7 style17 null"></td>
        <td class="column8 style15 f">21,626</td>
      </tr>
    </tfoot>
    
</table>
</body>
</html>


            `;

      // Generar Excel
      const config = {
        titulo: 'REPORTE  NUMEROS DE CONTROL MARZO 2024',
        subtitulo: 'NESTLE VENEZUELA, S.A RIF J-000129266',
        tituloAdicional: 'FACTURA SERVICIO: 00044562',
        logo: "../public/img/logo.png",
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
      console.error('Error al obtener Nro control:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
  }
};