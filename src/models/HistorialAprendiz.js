const mongoose = require('mongoose');

const historialAprendizSchema = new mongoose.Schema({
  aprendizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Aprendiz',
    required: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  tipoDocumento: {
    type: String,
    trim: true
  },
  documento: {
    type: String,
    trim: true
  },
  ciudad: {
    type: String,
    trim: true
  },
  programaFormacion: {
    type: String,
    trim: true
  },
  fechaInicioContrato: {
    type: Date
  },
  fechaInicioProductiva: {
    type: Date
  },
  fechaFinContrato: {
    type: Date
  },
  fechaFinalizacion: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('HistorialAprendiz', historialAprendizSchema);
