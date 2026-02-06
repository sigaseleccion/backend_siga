const mongoose = require('mongoose');

const convocatoriaSchema = new mongoose.Schema({
  idConvocatoria: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  nombreConvocatoria: {
    type: String,
    required: true,
    trim: true
  },
  programa: {
    type: String,
    required: true,
    trim: true
  },
  nivelFormacion: {
    type: String,
    required: true,
    enum: ['tecnica', 'tecnologia', 'profesional']
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ['en proceso', 'finalizado'],
    default: 'en proceso'
  },
  totalAprendices: {
    type: Number,
    default: 0
  },
  archivada: {
    type: Boolean,
    default: false
  },
  fechaArchivado: {
    type: Date
  }
  ,
  reporteTecnico: {
    url: { type: String },
    publicId: { type: String },
    uploadedAt: { type: Date }
  }
});

module.exports = mongoose.model('Convocatoria', convocatoriaSchema);
