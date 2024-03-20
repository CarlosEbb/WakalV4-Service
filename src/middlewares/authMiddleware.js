//authMiddleware.js
const jwt = require('jsonwebtoken');
const responseUtils = require('../utils/responseUtils');

module.exports = (req, res, next) => {
    // Obtener el token del encabezado de autorización
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        // Si no hay token, devolver un error de no autorizado
        const jsonResponse = responseUtils.createJSONResponse(401, 'No se proporcionó un token de acceso', {});
        return res.status(401).json(jsonResponse);
    }

    // Verificar el token
    jwt.verify(token, 'secretKey', (err, decodedToken) => {
        if (err) {
            // Si hay un error al verificar el token, devolver un error de no autorizado
            const jsonResponse = responseUtils.createJSONResponse(401, 'Token de acceso inválido', {});
            return res.status(401).json(jsonResponse);
        } else {
            // Si el token es válido, adjuntar la información del usuario al objeto de solicitud
            req.user = decodedToken;
            next(); // Continuar con la solicitud
        }
    });
};
