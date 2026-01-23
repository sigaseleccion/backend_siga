const Aprendiz = require('../models/Aprendiz');

// Obtener todos los aprendices
const obtenerAprendices = async (req, res) => {
  try {
    const aprendices = await Aprendiz.find().populate('convocatoriaId');
    res.json(aprendices);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener aprendices', error: error.message });
  }
};

// Obtener aprendiz por ID
const obtenerAprendizPorId = async (req, res) => {
  try {
    const aprendiz = await Aprendiz.findById(req.params.id).populate('convocatoriaId');
    if (!aprendiz) {
      return res.status(404).json({ message: 'Aprendiz no encontrado' });
    }
    res.json(aprendiz);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener aprendiz', error: error.message });
  }
};

// Crear aprendiz
const crearAprendiz = async (req, res) => {
  try {
    const nuevoAprendiz = new Aprendiz(req.body);
    await nuevoAprendiz.save();
    res.status(201).json({ message: 'Aprendiz creado exitosamente', aprendiz: nuevoAprendiz });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear aprendiz', error: error.message });
  }
};

// Actualizar aprendiz
const actualizarAprendiz = async (req, res) => {
  try {
    const aprendiz = await Aprendiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!aprendiz) {
      return res.status(404).json({ message: 'Aprendiz no encontrado' });
    }
    res.json({ message: 'Aprendiz actualizado', aprendiz });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar aprendiz', error: error.message });
  }
};

// Eliminar aprendiz
const eliminarAprendiz = async (req, res) => {
  try {
    const aprendiz = await Aprendiz.findByIdAndDelete(req.params.id);
    if (!aprendiz) {
      return res.status(404).json({ message: 'Aprendiz no encontrado' });
    }
    res.json({ message: 'Aprendiz eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar aprendiz', error: error.message });
  }
};

// Obtener aprendices por convocatoria
const obtenerAprendicesPorConvocatoria = async (req, res) => {
  try {
    const aprendices = await Aprendiz.find({ convocatoriaId: req.params.convocatoriaId });
    res.json(aprendices);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener aprendices', error: error.message });
  }
};

module.exports = {
  obtenerAprendices,
  obtenerAprendizPorId,
  crearAprendiz,
  actualizarAprendiz,
  eliminarAprendiz,
  obtenerAprendicesPorConvocatoria
};
