//checkRolePermissions.js
// Middleware para verificar el rol del usuario
export default function checkRolePermissions(allowedRoles) {
    return function(req, res, next) {
        // Verificar el rol del usuario extraído del token JWT
        const userRole = req.user.rolId; // Suponiendo que el rol del usuario está almacenado en req.user.rolId

        // Verificar si el usuario tiene uno de los roles permitidos
        if (allowedRoles.includes(userRole)) {
            next(); // Permitir que la solicitud continúe hacia el controlador de la ruta
        } else {
            // Si el usuario no tiene uno de los roles permitidos, devolver un error de acceso no autorizado
            res.status(403).json({ message: 'Acceso no autorizado' });
        }
    };
}
