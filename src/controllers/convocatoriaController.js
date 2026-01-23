const Convocatoria = require('../models/Convocatoria');

// Obtener todas las convocatorias
const obtenerConvocatorias = async (req, res) => {
  try {
    const convocatorias = await Convocatoria.find({ archivada: false });
    res.json(convocatorias);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener convocatorias', error: error.message });
  }
};

// Obtener convocatoria por ID
const obtenerConvocatoriaPorId = async (req, res) => {
  try {
    const convocatoria = await Convocatoria.findById(req.params.id);
    if (!convocatoria) {
      return res.status(404).json({ message: 'Convocatoria no encontrada' });
    }
    res.json(convocatoria);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener convocatoria', error: error.message });
  }
};

// Crear convocatoria
const crearConvocatoria = async (req, res) => {
  try {
    const nuevaConvocatoria = new Convocatoria(req.body);
    await nuevaConvocatoria.save();
    res.status(201).json({ message: 'Convocatoria creada exitosamente', convocatoria: nuevaConvocatoria });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear convocatoria', error: error.message });
  }
};

// Actualizar convocatoria
const actualizarConvocatoria = async (req, res) => {
  try {
    const convocatoria = await Convocatoria.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!convocatoria) {
      return res.status(404).json({ message: 'Convocatoria no encontrada' });
    }
    res.json({ message: 'Convocatoria actualizada', convocatoria });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar convocatoria', error: error.message });
  }
};

// Archivar convocatoria
const archivarConvocatoria = async (req, res) => {
  try {
    const convocatoria = await Convocatoria.findByIdAndUpdate(
      req.params.id,
      { archivada: true, fechaArchivado: new Date() },
      { new: true }
    );
    if (!convocatoria) {
      return res.status(404).json({ message: 'Convocatoria no encontrada' });
    }
    res.json({ message: 'Convocatoria archivada exitosamente', convocatoria });
  } catch (error) {
    res.status(500).json({ message: 'Error al archivar convocatoria', error: error.message });
  }
};

module.exports = {
  obtenerConvocatorias,
  obtenerConvocatoriaPorId,
  crearConvocatoria,
  actualizarConvocatoria,
  archivarConvocatoria
};
