const PruebaSeleccion = require('../models/PruebaSeleccion');
const Aprendiz = require('../models/Aprendiz');

// Obtener todas las pruebas
const obtenerPruebas = async (req, res) => {
  try {
    const pruebas = await PruebaSeleccion.find()
      .populate('aprendizId')
      .populate('convocatoriaId');
    res.json(pruebas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pruebas', error: error.message });
  }
};

// Obtener prueba por ID
const obtenerPruebaPorId = async (req, res) => {
  try {
    const prueba = await PruebaSeleccion.findById(req.params.id)
      .populate('aprendizId')
      .populate('convocatoriaId');
    if (!prueba) {
      return res.status(404).json({ message: 'Prueba no encontrada' });
    }
    res.json(prueba);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener prueba', error: error.message });
  }
};

// Crear prueba (con validación de duplicados por aprendiz y convocatoria)
const crearPrueba = async (req, res) => {
  try {
    const { aprendizId, convocatoriaId } = req.body;
    if (!aprendizId || !convocatoriaId) {
      return res.status(400).json({ message: 'aprendizId y convocatoriaId son requeridos' });
    }
    const existente = await PruebaSeleccion.findOne({ aprendizId, convocatoriaId });
    if (existente) {
      await Aprendiz.findByIdAndUpdate(aprendizId, { pruebaSeleccionId: existente._id });
      return res.status(200).json({ message: 'Ya existe una prueba asociada', prueba: existente });
    }
    const nuevaPrueba = new PruebaSeleccion({
      aprendizId,
      convocatoriaId,
    });
    await nuevaPrueba.save();
    await Aprendiz.findByIdAndUpdate(aprendizId, { pruebaSeleccionId: nuevaPrueba._id });
    res.status(201).json({ message: 'Prueba creada exitosamente', prueba: nuevaPrueba });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear prueba', error: error.message });
  }
};

// Actualizar prueba
const actualizarPrueba = async (req, res) => {
  try {
    const prueba = await PruebaSeleccion.findByIdAndUpdate(
      req.params.id,
      { ...req.body, fechaActualizacion: new Date() },
      { new: true }
    );
    if (!prueba) {
      return res.status(404).json({ message: 'Prueba no encontrada' });
    }
    res.json({ message: 'Prueba actualizada', prueba });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar prueba', error: error.message });
  }
};

// Eliminar prueba
const eliminarPrueba = async (req, res) => {
  try {
    const prueba = await PruebaSeleccion.findByIdAndDelete(req.params.id);
    if (!prueba) {
      return res.status(404).json({ message: 'Prueba no encontrada' });
    }
    res.json({ message: 'Prueba eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar prueba', error: error.message });
  }
};

// Obtener pruebas por aprendiz
const obtenerPruebasPorAprendiz = async (req, res) => {
  try {
    const pruebas = await PruebaSeleccion.find({ aprendizId: req.params.aprendizId })
      .populate('convocatoriaId');
    res.json(pruebas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pruebas', error: error.message });
  }
};

module.exports = {
  obtenerPruebas,
  obtenerPruebaPorId,
  crearPrueba,
  actualizarPrueba,
  eliminarPrueba,
  obtenerPruebasPorAprendiz
};
