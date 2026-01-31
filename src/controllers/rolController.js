const Rol = require('../models/Rol');

const crearRol = async (req, res) => {
  try {
    const { nombre, descripcion, permisos } = req.body;

    const existe = await Rol.findOne({ nombre });
    if (existe) {
      return res.status(400).json({ mensaje: 'El rol ya existe' });
    }

    const rol = await Rol.create({
      nombre,
      descripcion,
      permisos
    });

    res.status(201).json(rol);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear rol' });
  }
};

const listarRoles = async (req, res) => {
  try {
    const roles = await Rol.find()
      .populate({
        path: 'permisos.permiso',
        select: 'modulo'
      })
      .populate('permisos.privilegiosAsignados')
      .sort({ nombre: 1 });

    res.json(roles);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar roles' });
  }
};


const obtenerRolPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const rol = await Rol.findById(id)
      .populate({
        path: 'permisos.permiso',
        populate: { path: 'privilegiosDisponibles' }
      })
      .populate('permisos.privilegiosAsignados')
      .sort({ nombre: 1 });

    if (!rol) {
      return res.status(404).json({ mensaje: 'Rol no encontrado' });
    }

    res.json(rol);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener rol' });
  }
};

const actualizarRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, permisos, activo } = req.body;

    const rol = await Rol.findByIdAndUpdate(
      id,
      { nombre, descripcion, permisos, activo },
      { new: true }
    );

    if (!rol) {
      return res.status(404).json({ mensaje: 'Rol no encontrado' });
    }

    res.json(rol);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar rol' });
  }
};

const eliminarRol = async (req, res) => {
  try {
    const { id } = req.params;

    const rol = await Rol.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );

    if (!rol) {
      return res.status(404).json({ mensaje: 'Rol no encontrado' });
    }

    res.json({ mensaje: 'Rol desactivado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar rol' });
  }
};

module.exports = {
  crearRol,
  listarRoles,
  obtenerRolPorId,
  actualizarRol,
  eliminarRol
};

