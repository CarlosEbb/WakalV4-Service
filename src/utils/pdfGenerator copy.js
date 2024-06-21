export const getDataPDF = async (req, res) => {
  try {
    const pdfBuffer = await generatePDF();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="documento.pdf"');
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error('Error al obtener Nro control:', error);
    const jsonResponse = createJSONResponse(500, 'Servidor', { errors: ['Error interno del servidor'] });
    return res.status(500).json(jsonResponse);
  }
};

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

// Estas líneas son necesarias para obtener __dirname cuando se usa ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para convertir una imagen a Base64
const getBase64FromFile = (filePath) => {
  const file = fs.readFileSync(filePath);
  return `data:image/png;base64,${file.toString('base64')}`;
};

export const generatePDF = async () => {
  const doc = new jsPDF();

  // Obtén la imagen en Base64
  const imgPath = path.resolve(__dirname, '../public/img/banner_reporte.png');
  const imgData = await getBase64FromFile(imgPath);

  // Define las cabeceras de las columnas
  const headers = [["Nro", "Nro. Documentos", "Fecha de Asig", "Hora de Asig", 'Tipo de Documento', 'Serie']];

  // Define los datos de la tabla
  const data = [
    ["00-000001", "1017593", "12/04/2021", "Factura", "N"],
    ["00-000001", "1017592", "12/04/2022", "otro", "J"],
    // ... más datos
  ];

  // Obtén las dimensiones de la página
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Agrega la imagen al documento
  doc.addImage(imgData, 'PNG', 0, 0, pageWidth, 25);

  doc.autoTable({
    body: [
      [{ content: '', styles: { fillColor: false, textColor: [255, 255, 255], halign: 'center' } }, 
       { content: 'Reporte Detallado Nros. de Control Asignados Providencia 0032 Art.28', styles: { fillColor: false, textColor: [255, 255, 255], fontSize: 12, halign: 'center' } }],
      [{ content: '', styles: { fillColor: false, textColor: [255, 255, 255], halign: 'center' } }, 
       { content: 'NESTLE VENEZUELA, S.A RIF J-00012926-6', styles: { fillColor: false, textColor: [255, 255, 255], fontSize: 14, halign: 'center', fontStyle: 'bold' } }],
    ],
    columnStyles: { 0: { cellWidth: 40, halign: 'center' } },
    startY: 3,
    tableWidth: pageWidth,
    margin: { left: 0 }
  });
  

  // Agrega la tabla al documento
  doc.autoTable({
    head: headers,
    body: data,
    startY: 40, // Ajusta esta posición para que la tabla comience después de los textos
    didDrawCell: function(data) {
      // Tu código para la sombra aquí
    },
    // Opciones adicionales aquí
    didParseCell: function(data) {
      if (data.cell.section === 'head') {
        switch (data.column.index) {
          case 0:
            data.cell.styles.fillColor = '#1a77bc'; // Rojo para la primera columna
            break;
          case 1:
            data.cell.styles.fillColor = '#232951'; // Verde para la segunda columna
            break;
          case 2:
            data.cell.styles.fillColor = '#1577bf'; // Azul para la tercera columna
            break;
          case 3:
            data.cell.styles.fillColor = '#193a54'; // Azul para la tercera columna
            break;
          case 4:
            data.cell.styles.fillColor = '#1cb7c6'; // Azul para la tercera columna
            break;
          case 5:
            data.cell.styles.fillColor = '#212a4c'; // Azul para la tercera columna
            break;
        }
      }
    }
  });

  return doc.output('arraybuffer');
};
