export const ReporteAnualHtml = `<table>
        <thead>
            <tr>
                <th rowspan="2">EMISOR</th>
                <th rowspan="2">RIF</th>
                <th colspan="12">Año 2024</th>
                <th rowspan="2">Total</th>
            </tr>
            <tr>
                <th>enero</th>
                <th>febrero</th>
                <th>marzo</th>
                <th>abril</th>
                <th>mayo</th>
                <th>junio</th>
                <th>julio</th>
                <th>agosto</th>
                <th>septiembre</th>
                <th>octubre</th>
                <th>noviembre</th>
                <th>diciembre</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>SEGUROS</td>
                <td>J3334</td>
                <td>0</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>0</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
            </tr>
            <tr>
                <td>SEGUROS</td>
                <td>J3334</td>
                <td>0</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>0</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <td></td>
                <td>TOTALES</td>
                <td>0</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>0</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
            </tr>
        </tfoot>
    </table>`;

export const ReporteProv0032Html = `    <table>
        <thead>
            <tr>
                <th>Nro.</th>
                <th>Nro. Control</th>
                <th>Nro. Documento</th>
                <th>Fecha de Asignacion Nro. de Control</th>
                <th>Hora de Asignacion Nro. de Control</th>
                <th>Tipo de Documento</th>
                <th>Serie</th>
                <th>Serie Nro Factura</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>1</td>
                <td>12345</td>
                <td>987654321</td>
                <td>2024-07-01</td>
                <td>10:00:00</td>
                <td>Factura</td>
                <td>ABC</td>
                <td>123</td>
            </tr>
            <tr>
                <td>2</td>
                <td>54321</td>
                <td>876543210</td>
                <td>2024-06-30</td>
                <td>15:30:00</td>
                <td>Recibo</td>
                <td>XYZ</td>
                <td>456</td>
            </tr>
        </tbody>
    </table>`;

export const ReporteRangoControlHtml = `    <table>
        <thead>
            <tr>
                <th rowspan="2">SERIE</th>
                <th rowspan="2">CANTIDAD CTRL PRECOMPRADOS</th>
                <th rowspan="2">FECHA DE ASIGNACION PIE PAGINA</th>
                <th rowspan="2">IDENT. NRO.</th>
                <th colspan="2">RANGOS PIE DE PAGINA</th>
                <th colspan="2">CANTIDAD CONTROL ASIGNADOS</th>
                <th rowspan="2">CANTIDAD CTRL ASIGNADOS</th>
            </tr>
            <tr>
                <th>NRO CTRL INICIO</th>
                <th>NRO CTRL FINAL</th>
                <th>NRO CTRL INICIO</th>
                <th>NRO CTRL FINAL</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>N</td>
                <td>2,000</td>
                <td>1/3/2024</td>
                <td>00</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
            </tr>
            <tr>
                <td>N</td>
                <td>2,000</td>
                <td>1/3/2024</td>
                <td>00</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <td>TOTALES</td>
                <td>0</td>
                <td colspan="6"></td>
                <td>100</td>
            </tr>
        </tfoot>
    </table>`;

export const ReporteRangoControl2Html = `    <table>
        <thead>
            <tr>
                <th rowspan="2">SERIE</th>
                <th rowspan="2">CANTIDAD CTRL PRECOMPRADOS</th>
                <th rowspan="2">FECHA DE ASIGNACION PIE PAGINA</th>
                <th rowspan="2">IDENT. NRO.</th>
                <th colspan="2">RANGOS PIE DE PAGINA</th>
                <th colspan="2">CANTIDAD CONTROL ASIGNADOS</th>
                <th rowspan="2">CANTIDAD CTRL ASIGNADOS</th>
            </tr>
            <tr>
                <th>NRO CTRL INICIO</th>
                <th>NRO CTRL FINAL</th>
                <th>NRO CTRL INICIO</th>
                <th>NRO CTRL FINAL</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>N</td>
                <td>2,000</td>
                <td>1/3/2024</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
            </tr>
            <tr>
                <td>N</td>
                <td>2,000</td>
                <td>1/3/2024</td>
                <td>200</td>
                <td>200</td>
                <td>200</td>
                <td>200</td>
                <td>200</td>
                <td>200</td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <td>TOTALES</td>
                <td>0</td>
                <td colspan="6"></td>
                <td>100</td>
            </tr>
        </tfoot>
    </table>`;

export const ReporteSemanalHtml = `    <table>
        <thead>
            <tr>
                <th rowspan="2">EMISOR</th>
                <th rowspan="2">RIF</th>
                <th colspan="5">mar-24</th>
                <th rowspan="2">Total</th>
            </tr>
            <tr>
                <th>01-03</th>
                <th>04-10</th>
                <th>11-17</th>
                <th>18-24</th>
                <th>25-31</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>SEGUROS</td>
                <td>J3334</td>
                <td>0</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
            </tr>
            <tr>
                <td>SEGUROS</td>
                <td>J3334</td>
                <td>0</td>
                <td>200</td>
                <td>200</td>
                <td>200</td>
                <td>200</td>
                <td>200</td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <td></td>
                <td>TOTALES</td>
                <td>100</td>
                <td>100</td>
                <td>0</td>
                <td>100</td>
                <td>100</td>
                <td>100</td>
            </tr>
        </tfoot>
    </table>`;