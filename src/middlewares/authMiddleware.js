const jwt = require('jsonwebtoken');

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
const verificarPermiso = (modulo, accion) => {
  return (req, res, next) => {
    const permisos = req.usuario?.rol?.permisos;
    
    if (!permisos || !permisos[modulo] || !permisos[modulo][accion]) {
      return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
    }
    
    next();
  };
};

module.exports = {
  verificarToken,
  verificarPermiso
};
