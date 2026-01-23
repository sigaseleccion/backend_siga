const mongoose = require('mongoose');

const cuotaAprendizSchema = new mongoose.Schema({
  cuota: {
    type: Number,
    required: true
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  },
  actualizadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }
});

module.exports = mongoose.model('CuotaAprendiz', cuotaAprendizSchema);
