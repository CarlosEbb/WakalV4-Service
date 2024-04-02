//index.js
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import csrf from 'csurf'; // Importa csurf para la protección CSRF
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import consultaRoutes from './routes/consultaRoutes.js';
import totalDataRoutes from './routes/totalDataRoutes.js';

import {createJSONResponse} from './utils/responseUtils.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todas las rutas
app.use(cors());

// Middleware para establecer encabezados de tipo de contenido
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// Middleware de body-parser para procesar el cuerpo de las solicitudes
app.use(bodyParser.json());

// Middleware de cookie-parser para procesar cookies
app.use(cookieParser());

// Configuración de csurf
//app.use(csrf({ cookie: true }));//descomentar para usar csrf, recordar que esto hay que enviarlo en los formularios

// Rutas de Auth
app.use('/auth', authRoutes);

// Rutas de usuarios
app.use('/usuarios', userRoutes);

// Rutas de clientes
app.use('/clientes', clienteRoutes);

// Rutas para consultas
app.use('/consultas', consultaRoutes);

// Rutas para consultas de totales
app.use('/totalData', totalDataRoutes);

// Middleware para manejo de errores
app.use((err, req, res, next) => {
    console.error('Error no controlado:', err.message);
    // Ejemplo de respuesta de error genérica
    const jsonResponse = createJSONResponse(500, 'Error interno del servidor' , { errors: ['Error no controlado: '+ err.message] });
    res.status(500).json(jsonResponse);
});

app.use(cors({
    origin: ['http://localhost:4321'],
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});


