const Rol = require("../models/Rol");
const Usuario = require("../models/Usuario");

const crearRol = async (req, res) => {
  try {
    const { nombre, descripcion, permisos } = req.body;

    if (!permisos || permisos.length === 0) {
      return res.status(400).json({
        mensaje: "Debe asignar al menos un permiso al rol",
      });
    }

    // Verificar rol duplicado
    const existe = await Rol.findOne({
      nombre: { $regex: new RegExp(`^${nombre}$`, "i") },
    });

    if (existe) {
      return res.status(400).json({ mensaje: "El rol ya existe" });
    }

    const rol = await Rol.create({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      permisos,
    });

    res.status(201).json(rol);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        mensaje: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        mensaje: "Ya existe un rol con ese nombre",
      });
    }

    console.error(error);
    res.status(500).json({ mensaje: "Error al crear rol" });
  }
};

const listarRoles = async (req, res) => {
  try {
    const roles = await Rol.find()
      .populate({
        path: "permisos.permiso",
        select: "modulo",
      })
      .populate("permisos.privilegiosAsignados")
      .sort({ nombre: 1 });

    res.json(roles);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al listar roles" });
  }
};

const obtenerRolPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const rol = await Rol.findById(id)
      .populate({
        path: "permisos.permiso",
        populate: { path: "privilegiosDisponibles" },
      })
      .populate("permisos.privilegiosAsignados");

    if (!rol) {
      return res.status(404).json({ mensaje: "Rol no encontrado" });
    }

    // 🔎 Verificar si hay usuarios activos con este rol
    const usuariosActivos = await Usuario.exists({
      rol: id,
      activo: true,
    });

    res.json({
      rol,
      tieneUsuariosActivos: Boolean(usuariosActivos),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener rol" });
  }
};

const actualizarRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, permisos, activo } = req.body;

    // Si vienen permisos, no pueden quedar vacíos
    if (permisos && permisos.length === 0) {
      return res.status(400).json({
        mensaje: "El rol debe tener al menos un permiso",
      });
    }

    // Validar nombre duplicado (ignorando mayúsculas)
    if (nombre) {
      const existe = await Rol.findOne({
        _id: { $ne: id },
        nombre: { $regex: new RegExp(`^${nombre}$`, "i") },
      });

      if (existe) {
        return res.status(400).json({
          mensaje: "Ya existe otro rol con ese nombre",
        });
      }
    }

    if (activo === false) {
      const usuariosConRol = await Usuario.exists({
        rol: id,
        activo: true,
      });

      if (usuariosConRol) {
        return res.status(400).json({
          mensaje: "No se puede desactivar un rol con usuarios activos",
        });
      }
    }

    const rol = await Rol.findByIdAndUpdate(
      id,
      { nombre, descripcion, permisos, activo },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!rol) {
      return res.status(404).json({ mensaje: "Rol no encontrado" });
    }

    res.json(rol);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        mensaje: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        mensaje: "Ya existe un rol con ese nombre",
      });
    }

    console.error(error);
    res.status(500).json({ mensaje: "Error al actualizar rol" });
  }
};

const eliminarRol = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si hay usuarios activos con este rol
    const usuariosConRol = await Usuario.exists({
      rol: id,
      activo: true,
    });

    if (usuariosConRol) {
      return res.status(400).json({
        mensaje:
          "No se puede eliminar el rol porque hay usuarios activos asignados a él",
      });
    }

    // Eliminar el rol definitivamente
    const rol = await Rol.findByIdAndDelete(id);

    if (!rol) {
      return res.status(404).json({ mensaje: "Rol no encontrado" });
    }

    res.json({ mensaje: "Rol eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al eliminar rol" });
  }
};

module.exports = {
  crearRol,
  listarRoles,
  obtenerRolPorId,
  actualizarRol,
  eliminarRol,
};
