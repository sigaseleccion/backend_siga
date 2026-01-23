const Rol = require('../models/Rol');

// Obtener todos los roles
const obtenerRoles = async (req, res) => {
  try {
    const roles = await Rol.find();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener roles', error: error.message });
  }
};

// Obtener rol por ID
const obtenerRolPorId = async (req, res) => {
  try {
    const rol = await Rol.findById(req.params.id);
    if (!rol) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    res.json(rol);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener rol', error: error.message });
  }
};

// Crear rol
const crearRol = async (req, res) => {
  try {
    const nuevoRol = new Rol(req.body);
    await nuevoRol.save();
    res.status(201).json({ message: 'Rol creado exitosamente', rol: nuevoRol });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear rol', error: error.message });
  }
};

// Actualizar rol
const actualizarRol = async (req, res) => {
  try {
    const rol = await Rol.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!rol) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    res.json({ message: 'Rol actualizado', rol });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar rol', error: error.message });
  }
};

// Eliminar rol
const eliminarRol = async (req, res) => {
  try {
    const rol = await Rol.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
    if (!rol) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    res.json({ message: 'Rol desactivado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar rol', error: error.message });
  }
};

module.exports = {
  obtenerRoles,
  obtenerRolPorId,
  crearRol,
  actualizarRol,
  eliminarRol
};
