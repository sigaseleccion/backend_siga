const CuotaAprendiz = require('../models/CuotaAprendiz');

// Obtener cuota actual
const obtenerCuota = async (req, res) => {
  try {
    const cuota = await CuotaAprendiz.findOne()
      .sort({ fechaActualizacion: -1 })
      .populate('actualizadoPor', 'nombre correo');
    res.json(cuota);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener cuota', error: error.message });
  }
};

// Obtener historial de cuotas
const obtenerHistorialCuotas = async (req, res) => {
  try {
    const cuotas = await CuotaAprendiz.find()
      .sort({ fechaActualizacion: -1 })
      .populate('actualizadoPor', 'nombre correo');
    res.json(cuotas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener historial de cuotas', error: error.message });
  }
};

// Crear/Actualizar cuota
const actualizarCuota = async (req, res) => {
  try {
    const { cuota, actualizadoPor } = req.body;
    
    const nuevaCuota = new CuotaAprendiz({
      cuota,
      actualizadoPor,
      fechaActualizacion: new Date()
    });

    await nuevaCuota.save();
    res.status(201).json({ message: 'Cuota actualizada exitosamente', cuota: nuevaCuota });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar cuota', error: error.message });
  }
};

module.exports = {
  obtenerCuota,
  obtenerHistorialCuotas,
  actualizarCuota
};
