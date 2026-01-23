const ReporteTecnico = require('../models/ReporteTecnico');

// Obtener todos los reportes
const obtenerReportes = async (req, res) => {
  try {
    const reportes = await ReporteTecnico.find().populate('convocatoriaId');
    res.json(reportes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reportes', error: error.message });
  }
};

// Obtener reporte por ID
const obtenerReportePorId = async (req, res) => {
  try {
    const reporte = await ReporteTecnico.findById(req.params.id).populate('convocatoriaId');
    if (!reporte) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }
    res.json(reporte);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reporte', error: error.message });
  }
};

// Crear reporte
const crearReporte = async (req, res) => {
  try {
    const nuevoReporte = new ReporteTecnico(req.body);
    await nuevoReporte.save();
    res.status(201).json({ message: 'Reporte creado exitosamente', reporte: nuevoReporte });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear reporte', error: error.message });
  }
};

// Actualizar reporte
const actualizarReporte = async (req, res) => {
  try {
    const reporte = await ReporteTecnico.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reporte) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }
    res.json({ message: 'Reporte actualizado', reporte });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar reporte', error: error.message });
  }
};

// Eliminar reporte
const eliminarReporte = async (req, res) => {
  try {
    const reporte = await ReporteTecnico.findByIdAndDelete(req.params.id);
    if (!reporte) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }
    res.json({ message: 'Reporte eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar reporte', error: error.message });
  }
};

// Obtener reportes por convocatoria
const obtenerReportesPorConvocatoria = async (req, res) => {
  try {
    const reportes = await ReporteTecnico.find({ convocatoriaId: req.params.convocatoriaId });
    res.json(reportes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reportes', error: error.message });
  }
};

module.exports = {
  obtenerReportes,
  obtenerReportePorId,
  crearReporte,
  actualizarReporte,
  eliminarReporte,
  obtenerReportesPorConvocatoria
};
