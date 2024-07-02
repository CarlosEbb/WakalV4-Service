// excelGenerator.js
import cheerio from 'cheerio';
import Excel from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backgroundColor = 'FF1251a0';//FF2F75B5

const backgroundColor1 = 'FF85b71a'; // Primer color de fondo
const backgroundColor2 = 'FF1251a0'; // Segundo color de fondo

const fontColorWhite = 'FFFFFFFF';
const whiteBold = {
  color: { argb: fontColorWhite },
  bold: true
};

const fontColorBlue = 'FF4472C4';
const blueBold = {
  color: { argb: fontColorBlue },
  bold: true,
  size: 14
};

const fontColorBlack = 'FF000000';
const blackBold = {
  color: { argb: fontColorBlack },
  bold: true,
  size: 14
};

const fontColorGray = 'FF6c757d';
const blackBoldContend = {
  color: { argb: fontColorGray },
  bold: true,
  size: 11
};

const MAX_COLUMN_WIDTH = 15; // Define el ancho máximo para las columnas

export const createExcel = async (content, config = {}) => {
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

  const { titulo, subtitulo, tituloAdicional, logo } = config;
  
  const workbook = new Excel.Workbook();
  const sheet = workbook.addWorksheet('Reporte');

  if (logo) {
    // Añadir una imagen
    const imageId = workbook.addImage({
      filename: path.resolve(__dirname, logo),
      extension: 'png',
    });
  
    sheet.addImage(imageId, {
      tl: { col: 0, row: 0 }, // Posición superior izquierda de la imagen
      ext: { width: 250, height: 100 } // Tamaño de la imagen
    });
  }

  const alignmentStyle = {
    vertical: 'middle',
    horizontal: 'center',
    wrapText: true
  };

  const borderStyle = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  let currentRow = 7;
  let currentColglobal = 2;

  if (!titulo && !subtitulo && !tituloAdicional && !logo) {
    currentRow = 1;
    currentColglobal = 1;
  }

  let maxWidth = 0;
  const columnWidths = [];

  if(html){
    const $ = cheerio.load(content);

    $('table tr').each((i, tr) => {
      let currentCol = currentColglobal;
      let colCount = 0;
  
      $(tr).children().each((j, td) => {
        while (sheet.getCell(currentRow, currentCol).value !== null) {
          currentCol++;
        }
  
        const cell = sheet.getCell(currentRow, currentCol);
        cell.value = $(td).text();
        cell.alignment = alignmentStyle;
        cell.border = borderStyle;
  
        if ($(tr).parent().is('thead')) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: backgroundColor }
          };
          cell.font = whiteBold;
  
          const cellValueLength = cell.value.length;
          if (!columnWidths[currentCol - 1] || cellValueLength > columnWidths[currentCol - 1]) {
            columnWidths[currentCol - 1] = Math.min(cellValueLength, MAX_COLUMN_WIDTH);
          }
        } else if ($(tr).parent().is('tfoot')) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: backgroundColor }
          };
          cell.font = whiteBold;
        } else {
          cell.font = blackBoldContend;
        }
  
        const rowspan = $(td).attr('rowspan');
        const colspan = $(td).attr('colspan') ? parseInt($(td).attr('colspan')) : 1;
        colCount += colspan;
  
        if (rowspan || colspan > 1) {
          const endRow = rowspan ? currentRow + parseInt(rowspan) - 1 : currentRow;
          const endCol = currentCol + colspan - 1;
          sheet.mergeCells(currentRow, currentCol, endRow, endCol);
  
          for (let r = currentRow; r <= endRow; r++) {
            for (let c = currentCol; c <= endCol; c++) {
              const mergedCell = sheet.getCell(r, c);
              mergedCell.alignment = alignmentStyle;
              mergedCell.border = borderStyle;
              if ($(tr).parent().is('thead')) {
                mergedCell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: backgroundColor }
                };
                mergedCell.font = whiteBold;
              }
            }
          }
        }
  
        currentCol += colspan;
      });
      if (colCount > maxWidth) {
        maxWidth = colCount;
      }
      currentRow++;
    });
  }else{
    maxWidth = content.columns.length;
     // Código para procesar contenido JSON
    if (content.columns.length > 0 && content.body.length > 0) {
      // Agregar encabezados
      let currentCol = currentColglobal;
      content.columns.forEach((column, index) => {
        const cell = sheet.getCell(currentRow, currentCol + index);
        cell.value = column;
        cell.alignment = alignmentStyle;
        cell.border = borderStyle;
        
        // Alternar colores de fondo
        const backgroundColor = index % 2 === 0 ? backgroundColor1 : backgroundColor2;
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: backgroundColor }
        };

        cell.font = whiteBold;
        columnWidths.push(Math.min(column.length, MAX_COLUMN_WIDTH));
      });
      currentRow++;

      // Agregar datos de cuerpo
      content.body.forEach((row) => {
        let currentCol = currentColglobal;
        row.forEach((cellValue, index) => {
          const cell = sheet.getCell(currentRow, currentCol + index);
          cell.value = cellValue;
          cell.alignment = alignmentStyle;
          cell.border = borderStyle;
          cell.font = blackBoldContend;
          columnWidths.push(Math.min(cellValue.length, MAX_COLUMN_WIDTH));
        });
        currentRow++;
      });
    }
  }
  

  if (maxWidth <= 9) {
    maxWidth = 4;
  } else {
    maxWidth = maxWidth - 4;
  }

  const totalCenter = 4 + maxWidth;

  if (titulo) {
    const cell56 = sheet.getCell(2, 5);
    cell56.value = titulo;
    sheet.mergeCells(2, 5, 2, totalCenter);
    cell56.font = blackBold;
    cell56.alignment = alignmentStyle;
  }

  if (subtitulo) {
    const cell66 = sheet.getCell(3, 5);
    cell66.value = subtitulo;
    sheet.mergeCells(3, 5, 3, totalCenter);
    cell66.font = blueBold;
    cell66.alignment = alignmentStyle;
  }

  if (tituloAdicional) {
    const cellNroFact = sheet.getCell(2, 2 + totalCenter);
    cellNroFact.value = tituloAdicional;
    cellNroFact.alignment = alignmentStyle;

    cellNroFact.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: backgroundColor }
    };

    cellNroFact.font = whiteBold;
    sheet.mergeCells(2, 2 + totalCenter, 3, 3 + totalCenter);
    const range = sheet.getCell(5, 2 + totalCenter);
    range.border = borderStyle;
  }

  sheet.columns.forEach((column, index) => {
    if (columnWidths[index]) {
      column.width = columnWidths[index] + 2;
    }
  });

  return workbook;
};
