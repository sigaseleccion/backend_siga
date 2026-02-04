const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Login
const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    const usuario = await Usuario.findOne({ correo })
      .populate({
        path: 'rol',
        populate: [
          {
            path: 'permisos.permiso',
            select: 'modulo'
          },
          {
            path: 'permisos.privilegiosAsignados',
            select: 'clave etiqueta'
          }
        ]
      });

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    if (!usuario.activo) {
      return res.status(401).json({ message: 'Usuario desactivado' });
    }

    const contrasenaValida = await bcrypt.compare(
      contrasena,
      usuario.contrasena
    );

    if (!contrasenaValida) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error en el login',
      error: error.message
    });
  }
};


// Verificar token
const verificarToken = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id)
      .select("-contrasena")
      .populate("rol");
    res.json(usuario);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al verificar token", error: error.message });
  }
};

module.exports = {
  login,
  verificarToken,
};
