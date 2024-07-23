import { Buffer } from 'buffer';
import { js2xml } from 'xml-js'

function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  // Convert value to string
  let str = value.toString();

  // Escape quotes by doubling them
  if (str.includes('"')) {
    str = str.replace(/"/g, '""');
  }

  return str;
}

function jsonToDelimitedString(jsonArray, delimiter, isCsv) {
  const keys = Object.keys(jsonArray[0]);
  const header = keys.map(key => isCsv ? `"${escapeCsvValue(key)}"` : escapeCsvValue(key)).join(delimiter);
  const data = jsonArray
    .map(obj => keys.map(key => isCsv ? `"${escapeCsvValue(obj[key])}"` : escapeCsvValue(obj[key])).join(delimiter))
    .join('\n');

  return `${header}\n${data}`;
}

function jsonToXml(jsonArray) {
  const json = {
    root: {
      record: jsonArray.map((item) => {
        const record = {};
        for (const key in item) {
          record[key] = { _text: item[key] };
        }
        return record;
      }),
    },
  };

  return js2xml(json, { compact: true, spaces: 4 });
}

export async function createFile(data, format) {
  let content;
  
  if (format === 'xml') {
    content = jsonToXml(data);
  } else {
    const delimiter = format === 'csv' ? ';' : '|';
    const isCsv = format === 'csv';
    content = jsonToDelimitedString(data, delimiter, isCsv);
  }
  
  return Buffer.from(content, 'utf8');
}