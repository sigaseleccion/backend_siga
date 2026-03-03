const mongoose = require('mongoose');

const cuotaAprendizSchema = new mongoose.Schema({
  fechaInicial: {
    type: Date,
    required: true
  },
  fechaFinal: {
    type: Date,
    required: true
  },
  cuota: {
    type: Number,
    required: true
  },
  cantidadAprendices: {
    type: Number,
    required: false,  // No requerido - lo calcula el sistema automáticamente
    default: 0
  },
  estado: {
    type: String,
    enum: ['cumple', 'no cumple'],
    default: 'no cumple'
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  },
  actualizadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: false
  }
});

module.exports = mongoose.model('CuotaAprendiz', cuotaAprendizSchema);
