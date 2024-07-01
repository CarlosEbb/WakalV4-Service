//index.js
import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import csrf from 'csrf'; // Importar csurf para la protección CSRF
import cors from 'cors';
import helmet from "helmet";
import { rateLimit } from 'express-rate-limit'

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import rolRoutes from './routes/rolRoutes.js';
import auditoriasRoutes from './routes/auditoriasRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import consultaRoutes from './routes/consultaRoutes.js';
import consultasClienteRoutes from './routes/consultasClienteRoutes.js';


import {createJSONResponse} from './utils/responseUtils.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

//app.set('trust proxy', true);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res, next) => {
        const jsonResponse = createJSONResponse(429, 'Too many requests', {
            errors: ['Has alcanzado el límite de solicitudes. Por favor, espera unos minutos antes de intentarlo de nuevo.']
        });
        res.status(429).json(jsonResponse);
    }
});

// Middleware de cookie-parser para procesar cookies
app.use(cookieParser());

// Habilitar rate limit
app.use(limiter);

// Habilitar compresión
app.use(compression());

// Habilitar CORS para todas las rutas
// Configuración de CORS
app.use(cors({
    origin: ['http://localhost:8001', 'http://localhost:8002', 'https://wsplusqa.solucioneslaser.com', 'https://wakalplusqa.solucioneslaser.com'],
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization', 'csrf-token'],
    credentials: true  // Habilitar el envío de cookies y credenciales
}));

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Hacer que la carpeta 'uploads' sea pública
app.use('/uploads', express.static('uploads'));

// Habilitar Helmet!
app.use(helmet());

// Middleware para establecer encabezados de tipo de contenido
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// Middleware de body-parser para procesar el cuerpo de las solicitudes
app.use(bodyParser.json());

// Configurar csurf para CSRF
const tokens = new csrf();
const csrfProtection = (req, res, next) => {
    const csrfToken = req.headers['csrf-token'];
    if (!csrfToken || !tokens.verify(process.env.CSRF_SECRET, csrfToken)) {
        const jsonResponse = createJSONResponse(403, 'Forbidden', {
            errors: ['Token CSRF inválido']
        });
        return res.status(403).json(jsonResponse);
    }
    next();
};

// Endpoint para obtener y establecer el token CSRF en una cookie
app.get('/csrf-token', (req, res) => {
    const csrfToken = tokens.create(process.env.CSRF_SECRET);

    // Enviar el token CSRF como respuesta
    res.json({ csrfToken });
});


// Rutas de Auth con protección CSRF
app.use('/auth', csrfProtection, authRoutes);

// Rutas de usuarios
 app.use('/usuarios', csrfProtection, userRoutes);

// Rutas de Roles
 app.use('/roles', csrfProtection, rolRoutes);

// Rutas de Auditorias
 app.use('/auditorias', csrfProtection, auditoriasRoutes);

// Rutas de clientes
 app.use('/clientes', csrfProtection, clienteRoutes);

// Rutas para consultas
 app.use('/consultas', consultaRoutes);

// Rutas para consultas de cliente
 app.use('/consultasCliente', consultasClienteRoutes);

// Middleware para manejo de errores
app.use((err, req, res, next) => {
    console.error('Error no controlado:', err.message);
    // Ejemplo de respuesta de error genérica
    const jsonResponse = createJSONResponse(500, 'Error interno del servidor', { errors: ['Error no controlado: ' + err.message] });
    res.status(500).json(jsonResponse);
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
