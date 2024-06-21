import pdfMake from 'pdfmake/build/pdfmake.js';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';
import cheerio from 'cheerio';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

function processHtml(html) {
    const $ = cheerio.load(html, {
        xmlMode: true, // This ensures tags are treated as self-closing (like <tdhidden>)
        decodeEntities: false // This prevents decoding of entities like &nbsp;
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

export const createPDF = async (htmlString) => {
    console.log(processHtml(htmlString));
  const $ = cheerio.load(processHtml(htmlString));
  const docDefinition = {
    pageOrientation: 'landscape',
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
        lineHeight: 1.2 // Ajusta el interlineado según sea necesario
      },
      grayCell: {
        fontSize: 7,
        alignment: 'center',
        margin: [2, 2, 2, 2],
        fillColor: '#6c757d',
        color: '#FFFFFF',
        lineHeight: 1.2 // Ajusta el interlineado según sea necesario
      },
      footer: {
        fontSize: 7,
        bold: true,
        fillColor: '#2F75B5',
        color: '#FFFFFF',
        alignment: 'center'
      }
    }
  };

  const table = {
    headerRows: 2, // Ajusta el número de filas de encabezado según sea necesario
    widths: [],
    body: []
  };

  // Helper function to create a new row with empty cells
  const createEmptyRow = (length) => Array(length).fill({ text: '', margin: [2, 2, 2, 2], fit: [100, 100] });

  // Extract table header
  $('table thead tr').each((i, tr) => {
    const row = [];
    $(tr).find('td').each((j, td) => {
      const text = $(td).text().trim();
      const colspan = parseInt($(td).attr('colspan')) || 1;
      const rowspan = parseInt($(td).attr('rowspan')) || 1;

      console.log(`Header Cell (${i}, ${j}): Text='${text}', ColSpan=${colspan}, RowSpan=${rowspan}`);

      row.push({
        text,
        style: 'header',
        colSpan: colspan,
        rowSpan: rowspan,
        // Ajusta el alto de la celda según sea necesario
        height: rowspan > 1 ? rowspan * 20 : undefined // Ajusta 20 según sea necesario
      });

      // Add empty cells for the colSpan
      for (let k = 1; k < colspan; k++) {
        row.push({ text: '', margin: [2, 2, 2, 2], fit: [100, 100] });
      }
    });
    table.body.push(row);
  });

  // Extract table body
  $('table tbody tr').each((i, tr) => {
    const row = [];
    $(tr).find('td').each((j, td) => {
      const text = $(td).text().trim();
      const colspan = parseInt($(td).attr('colspan')) || 1;
      const rowspan = parseInt($(td).attr('rowspan')) || 1;
      const style = $(td).hasClass('gray') ? 'grayCell' : 'cell';

      console.log(`Body Cell (${i}, ${j}): Text='${text}', ColSpan=${colspan}, RowSpan=${rowspan}`);

      row.push({
        text,
        style,
        colSpan: colspan,
        rowSpan: rowspan,
        margin: [2, 2, 2, 2], // Ajusta el margen según sea necesario
        fit: [100, 100], // Ajusta el tamaño de ajuste según sea necesario
        lineHeight: 1.2 // Ajusta el interlineado para permitir más espacio vertical para el texto
      });

      // Add empty cells for the colSpan
      for (let k = 1; k < colspan; k++) {
        row.push({ text: '', margin: [2, 2, 2, 2], fit: [100, 100] });
      }
    });
    
    table.body.push(row);
  });

  // Extract table footer
  $('table tfoot tr').each((i, tr) => {
    const row = [];
    $(tr).find('td').each((j, td) => {
      const text = $(td).text().trim();
      const colspan = parseInt($(td).attr('colspan')) || 1;
      const rowspan = parseInt($(td).attr('rowspan')) || 1;

      console.log(`Footer Cell (${i}, ${j}): Text='${text}', ColSpan=${colspan}, RowSpan=${rowspan}`);

      row.push({
        text,
        style: 'footer',
        colSpan: colspan,
        rowSpan: rowspan,
        // Ajusta el alto de la celda según sea necesario
        height: rowspan > 1 ? rowspan * 20 : undefined // Ajusta 20 según sea necesario
      });

      // Add empty cells for the colSpan
      for (let k = 1; k < colspan; k++) {
        row.push({ text: '', margin: [2, 2, 2, 2], fit: [100, 100] });
      }
    });
    table.body.push(row);
  });

  // Set widths dynamically
  const maxCols = Math.max(...table.body.map(row => row.length));
  table.widths = Array(maxCols).fill('*');

  // Ensure all rows have the same number of cells
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
