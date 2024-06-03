import { executeQuery } from '../utils/dbUtils.js';

export default class Parametro {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.tipo_input = data.tipo_input;
        this.placeholder = data.placeholder;
        this.column_reference_cliente = data.column_reference_cliente;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    static async getAll() {
        const query = `
            SELECT *
            FROM parametros
        `;
        let params = [];
        
        const result = await executeQuery(process.env.DB_CONNECTION_ODBC, query, params);
    
        // Mapea cada objeto de resultado a una nueva instancia de Parametro
        const parametros = result.map(parametroData => new Parametro(parametroData));
    
        return parametros;
    }
    
}
