const mongoose = require('mongoose');

const pruebaSeleccionSchema = new mongoose.Schema({
  aprendizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Aprendiz',
    required: true
  },
  convocatoriaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Convocatoria',
    required: true
  },
  pruebaPsicologica: {
    type: String,
    enum: ['pendiente', 'aprobado', 'no aprobado'],
    default: 'pendiente'
  },
  pruebaTecnica: {
    type: String,
    enum: ['pendiente', 'aprobado', 'no aprobado'],
    default: 'pendiente'
  },
  examenesMedicos: {
    type: String,
    enum: ['pendiente', 'aprobado', 'no aprobado'],
    default: 'pendiente'
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PruebaSeleccion', pruebaSeleccionSchema);
