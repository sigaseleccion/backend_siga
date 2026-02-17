const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { transporter } = require("../config/mailer");

// Login
const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    const usuario = await Usuario.findOne({ correo }).populate({
      path: "rol",
      populate: [
        {
          path: "permisos.permiso",
          select: "modulo",
        },
        {
          path: "permisos.privilegiosAsignados",
          select: "clave etiqueta",
        },
      ],
    });

    if (!usuario) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    if (!usuario.activo) {
      return res.status(401).json({ message: "Usuario desactivado" });
    }

    const contrasenaValida = await bcrypt.compare(
      contrasena,
      usuario.contrasena,
    );

    if (!contrasenaValida) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.json({
      message: "Login exitoso",
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error en el login",
      error: error.message,
    });
  }
};

// Verificar token
const verificarToken = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id)
      .select("-contrasena")
      .populate({
        path: "rol",
        populate: [
          {
            path: "permisos.permiso",
            select: "modulo",
          },
          {
            path: "permisos.privilegiosAsignados",
            select: "clave etiqueta",
          },
        ],
      });

    res.json(usuario);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al verificar token", error: error.message });
  }
};

const solicitarCodigoRecuperacion = async (req, res) => {
  try {
    const { correo } = req.body;

    const usuario = await Usuario.findOne({ correo });

    if (!usuario) {
      return res.json({
        mensaje: "Si el correo existe, se enviará un código de recuperación",
      });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    const codigoHasheado = crypto
      .createHash("sha256")
      .update(codigo)
      .digest("hex");

    usuario.codigoRecuperacion = codigoHasheado;
    usuario.codigoRecuperacionExpira = Date.now() + 10 * 60 * 1000;
    usuario.intentosRecuperacion = 0;

    await usuario.save();

    res.json({
      mensaje: "Si el correo existe, se enviará un código",
    });

    transporter
      .sendMail({
        to: usuario.correo,
        subject: "Código de recuperación",
        html: `
    <h3>Recuperación de contraseña</h3>
    <p>Tu código es:</p>
    <h2>${codigo}</h2>
    <p>Este código vence en 10 minutos.</p>
  `,
      })
      .catch((err) => console.error("Error enviando correo:", err));
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al procesar la solicitud" });
  }
};

const verificarCodigoRecuperacion = async (req, res) => {
  try {
    const { correo, codigo } = req.body;

    const usuario = await Usuario.findOne({ correo });

    if (!usuario) {
      return res.status(400).json({ mensaje: "Código inválido" });
    }

    if (usuario.intentosRecuperacion >= 3) {
      return res.status(403).json({
        mensaje: "Demasiados intentos fallidos. Solicita un nuevo código.",
      });
    }

    const codigoHasheado = require("crypto")
      .createHash("sha256")
      .update(codigo)
      .digest("hex");

    if (
      usuario.codigoRecuperacion !== codigoHasheado ||
      usuario.codigoRecuperacionExpira < Date.now()
    ) {
      usuario.intentosRecuperacion += 1;
      await usuario.save();

      return res.status(400).json({
        mensaje: "Código incorrecto o expirado",
      });
    }

    res.json({ mensaje: "Código válido" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al verificar código" });
  }
};

const restablecerContrasena = async (req, res) => {
  try {
    const { correo, codigo, nuevaContrasena } = req.body;

    const usuario = await Usuario.findOne({ correo });

    if (!usuario) {
      return res.status(400).json({ mensaje: "Código inválido" });
    }

    // 🚨 Límite de intentos (3)
    if (usuario.intentosRecuperacion >= 3) {
      return res.status(403).json({
        mensaje: "Demasiados intentos fallidos. Solicita un nuevo código.",
      });
    }

    const codigoHasheado = crypto
      .createHash("sha256")
      .update(codigo)
      .digest("hex");

    if (
      usuario.codigoRecuperacion !== codigoHasheado ||
      usuario.codigoRecuperacionExpira < Date.now()
    ) {
      usuario.intentosRecuperacion += 1;
      await usuario.save();

      return res.status(400).json({
        mensaje: "Código inválido o expirado",
      });
    }

    const salt = await bcrypt.genSalt(10);
    usuario.contrasena = await bcrypt.hash(nuevaContrasena, salt);

    usuario.codigoRecuperacion = undefined;
    usuario.codigoRecuperacionExpira = undefined;
    usuario.intentosRecuperacion = 0;

    await usuario.save();

    res.json({
      mensaje: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Error al restablecer contraseña",
    });
  }
};

module.exports = {
  login,
  verificarToken,
  solicitarCodigoRecuperacion,
  verificarCodigoRecuperacion,
  restablecerContrasena,
};
