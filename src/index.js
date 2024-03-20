//index.js
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const csrf = require('csurf'); // Importa csurf para la protección CSRF

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const clienteRoutes = require('./routes/clienteRoutes');

const executeQuery = require('./utils/dbUtils');
const responseUtils = require('./utils/responseUtils');
const app = express();
const PORT = process.env.PORT || 3000;

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


// Middleware para manejo de errores
app.use((err, req, res, next) => {
    console.error('Error no controlado:', err.message);
    // Ejemplo de respuesta de error genérica
    const jsonResponse = responseUtils.createJSONResponse(500, 'Error no controlado: '+ err.message, {});
    res.status(500).json(jsonResponse);
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
