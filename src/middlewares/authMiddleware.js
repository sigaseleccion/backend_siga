const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const verificarToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// Middleware para verificar permisos específicos
const autorizar = (modulo, accion) => {
  return async (req, res, next) => {
    try {
      const usuario = await Usuario.findById(req.usuario.id)
        .populate({
          path: 'rol',
          populate: {
            path: 'permisos.permiso permisos.privilegiosAsignados'
          }
        });

      if (!usuario || !usuario.rol || !usuario.rol.activo) {
        return res.status(403).json({ mensaje: 'Rol no válido' });
      }

      const permisoEncontrado = usuario.rol.permisos.find(
        p => p.permiso.modulo === modulo
      );

      if (!permisoEncontrado) {
        return res.status(403).json({ mensaje: 'Sin acceso al módulo' });
      }

      const tienePrivilegio = permisoEncontrado.privilegiosAsignados.some(
        priv => priv.clave === accion
      );

      if (!tienePrivilegio) {
        return res.status(403).json({ mensaje: 'Acción no permitida' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ mensaje: 'Error de autorización' });
    }
  };
};

module.exports = {
  verificarToken,
  autorizar
};
