import pdfMake from 'pdfmake/build/pdfmake.js';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';
import cheerio from 'cheerio';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export const createPDF = async (htmlString, config = {}) => {
  if (!htmlString) throw new Error('HTML string es requerido');

  const { titulo, subtitulo, tituloAdicional, logo } = config;

  const $ = cheerio.load(processHtml(htmlString));
  const docDefinition = {
    pageOrientation: 'landscape',
    header: {
      stack: [
        {
          image: await getBase64FromFile(logo),
          width: 850,
          height: 80,
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
          margin: [0, -60, 0, 0] // Ajustar el margen para que la tabla se superponga a la imagen
        },
      ],
    },
    content: [],
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
      title: 'Reporte',
      author: 'Soluciones Laser C.A ',
      subject: 'Sistema automatizado Wakal 4.0',
      keywords: 'documento, reporte, wakal, imprenta, digital',
      creator: 'Wakal 4.0'
    }
  };

  const table = {
    headerRows: 2,
    widths: [],
    body: [],
  };

  const createEmptyRow = (length) => Array(length).fill({ text: '', margin: [2, 2, 2, 2], fit: [100, 100] });

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

  const pdfDoc = pdfMake.createPdf(docDefinition);

  return new Promise((resolve, reject) => {
    pdfDoc.getBuffer((buffer) => {
      resolve(buffer);
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
