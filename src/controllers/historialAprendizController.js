const HistorialAprendiz = require('../models/HistorialAprendiz');

// Obtener todo el historial
const obtenerHistorial = async (req, res) => {
  try {
    const historial = await HistorialAprendiz.find().populate('aprendizId');
    res.json(historial);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener historial', error: error.message });
  }
};

// Obtener historial por ID
const obtenerHistorialPorId = async (req, res) => {
  try {
    const historial = await HistorialAprendiz.findById(req.params.id).populate('aprendizId');
    if (!historial) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }
    res.json(historial);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener registro', error: error.message });
  }
};

// Crear registro de historial
const crearHistorial = async (req, res) => {
  try {
    const nuevoHistorial = new HistorialAprendiz(req.body);
    await nuevoHistorial.save();
    res.status(201).json({ message: 'Historial creado exitosamente', historial: nuevoHistorial });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear historial', error: error.message });
  }
};

// Actualizar historial
const actualizarHistorial = async (req, res) => {
  try {
    const historial = await HistorialAprendiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!historial) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }
    res.json({ message: 'Historial actualizado', historial });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar historial', error: error.message });
  }
};

// Eliminar historial
const eliminarHistorial = async (req, res) => {
  try {
    const historial = await HistorialAprendiz.findByIdAndDelete(req.params.id);
    if (!historial) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }
    res.json({ message: 'Historial eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar historial', error: error.message });
  }
};

// Obtener historial por aprendiz
const obtenerHistorialPorAprendiz = async (req, res) => {
  try {
    const historial = await HistorialAprendiz.find({ aprendizId: req.params.aprendizId });
    res.json(historial);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener historial', error: error.message });
  }
};

module.exports = {
  obtenerHistorial,
  obtenerHistorialPorId,
  crearHistorial,
  actualizarHistorial,
  eliminarHistorial,
  obtenerHistorialPorAprendiz
};
