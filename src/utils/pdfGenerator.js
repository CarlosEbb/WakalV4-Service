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
  let isCustomJSON = false; // Para verificar si es el nuevo formato JSON

  if (typeof content === 'string') {
    const trimmedContent = content.trim();
    if (trimmedContent.startsWith('<') && trimmedContent.endsWith('>')) {
      html = true;
    } else {
      html = false;
    }
  } else if (typeof content === 'object') {
    if (!Array.isArray(content) && content.columns && content.body && Array.isArray(content.columns) && Array.isArray(content.body)) {
      html = false;
    } else if (Array.isArray(content) && content.length > 0 && content[0].numero_control) {
      isCustomJSON = true;
      html = false;
    } else {
      return generateErrorPDF('No hay resultados que coincidan con los filtros aplicados.');
    }
  } else {
    return generateErrorPDF('El tipo de contenido no es válido');
  }

  const { titulo, subtitulo, tituloAdicional = '', tituloAdicional2 = '', pageOrientation = 'portrait' } = config;
  let logo = "../public/img/banner_reporte.jpg";
  let widthImage = 600;
  let heightImage = 60;
  let margintopImage = -50;
  let margintopTable = -20;
  let contentPDF = [];

  if(pageOrientation != 'portrait'){
    widthImage = 850;
    heightImage = 70;
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


  
  if (html) {
    const $ = cheerio.load(processHtml(content));
    
    // Selecciona todas las tablas
    $('table').each((index, tableElement) => {
      const table = {
        headerRows: config.headerRows ? config.headerRows : 1,
        widths: [],
        body: [],
      };
  
      $(tableElement).find('thead tr').each((i, tr) => {
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
  
      $(tableElement).find('tbody tr').each((i, tr) => {
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
  
      $(tableElement).find('tfoot tr').each((i, tr) => {
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
      
      table.widths = config.table.widths? config.table.widths: Array(maxCols).fill('*');
  
      table.body = table.body.map(row => {
        const newRow = [...row];
        while (newRow.length < maxCols) {
          newRow.push({ text: '', margin: [2, 2, 2, 2], fit: [100, 100] });
        }
        return newRow;
      });
  
      console.log(table.widths);

      docDefinition.content.push({ table });
    });
  }else if(isCustomJSON) {
    // Reemplaza las claves en columns
    let columns = Object.keys(content[0]);
    if(config.config_params){
      // Mapea los valores a los nombres
      const nameMap = config.config_params.reduce((acc, { value, nombre }) => {
        acc[value] = nombre;
        return acc;
      }, {});

      columns = columns.map(key => nameMap[key] || key);
    }
   
    const body = content.map(row => Object.values(row));

    let fontSizeTemp;
    let restarFontSize = columns.length > 10 ? 3 : 0;
    const headerColors = ['#258d19', '#1251a0'];
    const bodyColors = ['#fdfdfd', '#eeeced'];

    body.unshift(columns);

    const tableBody = body.map((row, rowIndex) => {
      return row.map((cell, colIndex) => {
        let fillColor = '';
        let textColor = '';
        let bold = false;
        let alignment = 'center';

        if (rowIndex === 0) {
          fillColor = headerColors[colIndex % headerColors.length];
          textColor = '#FFFFFF';
          fontSizeTemp = docDefinition.styles.header.fontSize;
          bold = true;
        } else {
          fillColor = bodyColors[(rowIndex - 1) % bodyColors.length];
          textColor = '#000000';
          fontSizeTemp = docDefinition.styles.cell.fontSize;
        }
        return { text: cell, fillColor: fillColor, color: textColor, bold: bold, alignment: alignment, fontSize: fontSizeTemp - restarFontSize, margin: [2, 2, 2, 2] };
      });
    });

    const table = {
      headerRows: 1,
      dontBreakRows: true,
      widths: config.config_params
        ? columns.length === 6
          ? ['auto', ...columns.slice(1).map(() => '*')] // Si hay exactamente 6 columnas, la primera 'auto', las demás '*'
          : columns.length >= 14
          ? [...columns.slice(0, -1).map(() => 'auto'), '*'] // Si hay 14 o más columnas, todas 'auto' excepto la última que será '*'
          : columns.map((col, index) => index < 6 ? 'auto' : '*') // Si hay más de 6 columnas pero menos de 14, las primeras 6 'auto', las demás '*'
        : [...columns.slice(0, -1).map(() => 'auto'), '*'], // Si config.config_params no está disponible, todas 'auto' menos la última '*'
      body: tableBody,
    };

    docDefinition.content.push({ table });
  }else{
    const { columns, body } = content;
    let fontSizeTemp;
    let restarFontSize = columns.length > 15 ? 3 : 0;
    // Colores para el header intercalados
    const headerColors = ['#258d19', '#1251a0'];
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
          fontSizeTemp = docDefinition.styles.header.fontSize;
          bold = true;
        } else {
          // Body rows
          fillColor = bodyColors[(rowIndex - 1) % bodyColors.length];
          textColor = '#000000';
          fontSizeTemp = docDefinition.styles.cell.fontSize
        }
        return { text: cell, fillColor: fillColor, color: textColor, bold: bold, alignment: alignment, fontSize: fontSizeTemp - restarFontSize, border: [true, true, true, true] };
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

function generateErrorPDF(errorMessage) {
  const docDefinition = {
    content: [
      { text: 'Error', style: 'header' },
      { text: errorMessage, style: 'error' }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      error: {
        fontSize: 12,
        color: 'red'
      }
    }
  };

  const pdfDoc = pdfMake.createPdf(docDefinition);
  return new Promise((resolve, reject) => {
    pdfDoc.getBuffer(buffer => {
      resolve(buffer);
    });
  });
}