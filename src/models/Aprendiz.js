const mongoose = require('mongoose');

const aprendizSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  tipoDocumento: {
    type: String,
    required: true,
    enum: ['CC', 'CE', 'TI', 'PPT', 'PEP']
  },
  documento: {
    type: String,
    required: true
  },
  ciudad: {
    type: String,
    trim: true
  },
  direccion: {
    type: String,
    trim: true
  },
  telefono: {
    type: String,
    trim: true
  },
  correo: {
    type: String,
    lowercase: true,
    trim: true
  },
  programaFormacion: {
    type: String,
    trim: true
  },
  fechaInicioLectiva: {
    type: Date
  },
  fechaFinLectiva: {
    type: Date
  },
  fechaInicioProductiva: {
    type: Date
  },
  fechaFinProductiva: {
    type: Date
  },
  fechaInicioContrato: {
    type: Date
  },
  fechaFinContrato: {
    type: Date
  },
  convocatoriaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Convocatoria'
  },
  estadoConvocatoria: {
    type: String,
    enum: ['no seleccionado', 'seleccionado'],
    default: 'no seleccionado'
  },
  ranking: {
    type: Number
  },
  aprendicesRecomendados: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Aprendiz'
  }],
  etapaActual: {
    type: String,
    enum: ['seleccion1', 'seleccion2', 'lectiva', 'productiva', 'finalizado'],
    default: 'seleccion1'
  }
});

module.exports = mongoose.model('Aprendiz', aprendizSchema);
