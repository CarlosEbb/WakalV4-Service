import pdfMake from 'pdfmake/build/pdfmake.js';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';
import cheerio from 'cheerio';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export const createPDF = async (content, config = {}) => {
  if (!content) throw new Error('Content es requerido');

  let html = true; // Por defecto asumimos que es HTML

  if (typeof content === 'string') {
    // Verificamos si es una cadena que podría ser HTML
    const trimmedContent = content.trim();
    if (trimmedContent.startsWith('<') && trimmedContent.endsWith('>')) {
      html = true;
    } else {
      html = false;
    }
  } else if (typeof content === 'object' && !Array.isArray(content)) {
    // Verificamos si es un objeto (JSON)
    // Validamos que tenga las propiedades esperadas: columns y body
    if (content.columns && content.body && Array.isArray(content.columns) && Array.isArray(content.body)) {
      html = false;
    } else {
      throw new Error('El objeto JSON content no tiene la estructura esperada');
    }
  } else {
    throw new Error('El tipo de contenido no es válido');
  }

  const { titulo, subtitulo, tituloAdicional = '', tituloAdicional2 = '', logo, pageOrientation = 'portrait' } = config;

  let widthImage = 600;
  let heightImage = 60;
  let margintopImage = -50;
  let margintopTable = -20;
  let contentPDF = [];

  if(pageOrientation != 'portrait'){
    widthImage = 850;
    heightImage = 80;
    margintopImage = -60;
    margintopTable = -10;
  }

  if(tituloAdicional != '' ||  tituloAdicional2 != ''){
    contentPDF = [{
      table: {
        widths: ['*', '*'],
        body: [
          [{ text: tituloAdicional, border: [false, false, false, false], color: '#6f7179', fontSize: 9, bold: true }, { text: tituloAdicional2, alignment: 'center', border: [false, false, false, false], color: '#6f7179', fontSize: 9, bold: true }]
        ]
      },
      layout: 'noBorders',
      margin: [0, margintopTable, 0, 10]
    }];
  }

  const docDefinition = {
    pageOrientation: pageOrientation, //landscape
    header: {
      stack: [
        {
          image: await getBase64FromFile(logo),
          width: widthImage,
          height: heightImage,
          margin: [0, 0, 0, 0],
          alignment: 'center'
        },
        {
          table: {
            widths: [100, '*'],
            body: [
              [{ text: '', border: [false, false, false, false] }, { text: titulo, alignment: 'center', border: [false, false, false, false], color: '#FFFFFF', fontSize: 13 }],
              [{ text: '', border: [false, false, false, false] }, { text: subtitulo, alignment: 'center', border: [false, false, false, false], color: '#FFFFFF', fontSize: 16, bold: true }]
            ]
          },
          layout: 'noBorders',
          margin: [0, margintopImage, 0, 0]
        },
      ],
    },
    content: contentPDF,
    styles: {
      header: {
        fontSize: 8,
        bold: true,
        fillColor: '#2F75B5',
        color: '#FFFFFF',
        alignment: 'center'
      },
      cell: {
        fontSize: 7,
        alignment: 'center',
        margin: [2, 2, 2, 2],
        lineHeight: 1.2
      },
      grayCell: {
        fontSize: 7,
        alignment: 'center',
        margin: [2, 2, 2, 2],
        fillColor: '#6c757d',
        color: '#FFFFFF',
        lineHeight: 1.2
      },
      footer: {
        fontSize: 7,
        bold: true,
        fillColor: '#2F75B5',
        color: '#FFFFFF',
        alignment: 'center'
      }
    },
    pageMargins: [30, 100, 30, 30],
    info: {
      title: process.env.PDF_GENERATOR_TITLE,
      author: process.env.PDF_GENERATOR_AUTHOR,
      subject: process.env.PDF_GENERATOR_SUBJECT,
      keywords: process.env.PDF_GENERATOR_KEYWORDS,
      creator: process.env.PDF_GENERATOR_CREATOR
    }
  };


  
  if(html){
    const $ = cheerio.load(processHtml(content));

    const table = {
      headerRows: 2,
      widths: [],
      body: [],
    };

    $('table thead tr').each((i, tr) => {
      const row = [];
      $(tr).find('td').each((j, td) => {
        const text = $(td).text().trim();
        const colspan = parseInt($(td).attr('colspan')) || 1;
        const rowspan = parseInt($(td).attr('rowspan')) || 1;

        row.push({
          text,
          style: 'header',
          colSpan: colspan,
          rowSpan: rowspan,
          height: rowspan > 1 ? rowspan * 20 : undefined,
        });

        for (let k = 1; k < colspan; k++) {
          row.push({ text: '', margin: [2, 2, 2, 2], fit: [100, 100] });
        }
      });
      table.body.push(row);
    });

    $('table tbody tr').each((i, tr) => {
      const row = [];
      $(tr).find('td').each((j, td) => {
        const text = $(td).text().trim();
        const colspan = parseInt($(td).attr('colspan')) || 1;
        const rowspan = parseInt($(td).attr('rowspan')) || 1;
        const style = $(td).hasClass('gray') ? 'grayCell' : 'cell';

        row.push({
          text,
          style,
          colSpan: colspan,
          rowSpan: rowspan,
          margin: [2, 2, 2, 2],
          fit: [100, 100],
          lineHeight: 1.2,
        });

        for (let k = 1; k < colspan; k++) {
          row.push({ text: '', margin: [2, 2, 2, 2], fit: [100, 100] });
        }
      });
      table.body.push(row);
    });

    $('table tfoot tr').each((i, tr) => {
      const row = [];
      $(tr).find('td').each((j, td) => {
        const text = $(td).text().trim();
        const colspan = parseInt($(td).attr('colspan')) || 1;
        const rowspan = parseInt($(td).attr('rowspan')) || 1;

        row.push({
          text,
          style: 'footer',
          colSpan: colspan,
          rowSpan: rowspan,
          height: rowspan > 1 ? rowspan * 20 : undefined,
        });

        for (let k = 1; k < colspan; k++) {
          row.push({ text: '', margin: [2, 2, 2, 2], fit: [100, 100] });
        }
      });
      table.body.push(row);
    });

    const maxCols = Math.max(...table.body.map(row => row.length));
    table.widths = Array(maxCols).fill('*');

    table.body = table.body.map(row => {
      const newRow = [...row];
      while (newRow.length < maxCols) {
        newRow.push({ text: '', margin: [2, 2, 2, 2], fit: [100, 100] });
      }
      return newRow;
    });

    docDefinition.content.push({ table });
  }else{
    const { columns, body } = content;
   
    // Colores para el header intercalados
    const headerColors = ['#85b71a', '#1251a0'];
    // Colores para las filas del body intercalados
    const bodyColors = ['#fdfdfd', '#eeeced'];

    // Agregamos las columnas al inicio de las filas de contenido
    body.unshift(columns);

    // Construimos el cuerpo de la tabla con los colores intercalados
    const tableBody = body.map((row, rowIndex) => {
      return row.map((cell, colIndex) => {
        let fillColor = '';
        let textColor = '';
        let bold = false;
        let alignment = 'center';

        if (rowIndex === 0) {
          // Header row
          fillColor = headerColors[colIndex % headerColors.length];
          textColor = '#FFFFFF';
          //bold = true;
        } else {
          // Body rows
          fillColor = bodyColors[(rowIndex - 1) % bodyColors.length];
          textColor = '#000000';
        }
        return { text: cell, fillColor: fillColor, color: textColor, bold: bold, alignment: alignment, border: [true, true, true, true] };
      });
    });
   
    const table = {
      headerRows: 1,
      widths: columns.map(() => '*'), // Ajusta las columnas para que ocupen todo el ancho
      body: tableBody,
    };
    docDefinition.content.push({
      table,
      layout: {
        hLineColor: () => '#FFFFFF', // Color de las líneas horizontales
        vLineColor: () => '#FFFFFF', // Color de las líneas verticales
        hLineWidth: () => 1, // Grosor de las líneas horizontales
        vLineWidth: () => 1, // Grosor de las líneas verticales
      },
    });
  }

  const pdfDoc = pdfMake.createPdf(docDefinition);
  return new Promise((resolve, reject) => {
    pdfDoc.getBuffer(async (buffer) => {
      try {
        if (process.env.PDF_GENERATOR_PROVEEDOR_ACTIVO === 'true') {
          const pdfDocLib = await PDFDocument.load(buffer);
          pdfDocLib.setProducer(process.env.PDF_GENERATOR_PROVEEDOR); // Cambiar el campo Producer
          const modifiedPdfBytes = await pdfDocLib.save();
          resolve(Buffer.from(modifiedPdfBytes));
        } else {
          resolve(buffer);
        }
      } catch (error) {
        reject(error);
      }
    });
  });

};

function processHtml(html) {
  const $ = cheerio.load(html, {
    xmlMode: true,
    decodeEntities: false,
  });

  $('tdhidden').each((index, element) => {
    const $tdhidden = $(element);
    const numericValue = parseInt($tdhidden.text(), 10);

    if (!isNaN(numericValue)) {
      const tdCount = numericValue;
      const replacement = Array(tdCount).fill('<td></td>').join('');
      $tdhidden.replaceWith(replacement);
    } else {
      $tdhidden.replaceWith('<td></td>');
    }
  });

  return $.html();
}

const getBase64FromFile = (filePath) => {
  const imgPath = path.resolve(__dirname, filePath);
  const file = fs.readFileSync(imgPath);
  return `data:image/png;base64,${file.toString('base64')}`;
};

export function getTextWidth(text, fontSize) {
  const approxCharWidth = 0.6 * fontSize;
  return text.length * approxCharWidth;
}
