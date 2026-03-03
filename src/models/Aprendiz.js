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
  pruebaSeleccionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PruebaSeleccion'
  },
  etapaActual: {
    type: String,
    enum: ['seleccion1', 'seleccion2', 'lectiva', 'productiva', 'finalizado'],
    default: 'seleccion1'
  },
  reemplazoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Aprendiz',
    default: null
  },
  apReemplazar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Aprendiz',
    default: null
  }

});

// Middleware pre-save: Normalizar fechas de contrato manteniendo el día exacto
// Previene problemas de timezone que desfasan las fechas en ±1 día
aprendizSchema.pre('save', function(next) {
  // Normalizar fechaInicioContrato a medianoche del día exacto (sin conversión de timezone)
  if (this.fechaInicioContrato && this.isModified('fechaInicioContrato')) {
    const fecha = new Date(this.fechaInicioContrato);
    // Crear fecha UTC con el mismo día/mes/año para evitar desfases
    const fechaNormalizada = new Date(Date.UTC(
      fecha.getFullYear(), 
      fecha.getMonth(), 
      fecha.getDate(), 
      0, 0, 0, 0
    ));
    this.fechaInicioContrato = fechaNormalizada;
  }

  // Normalizar fechaFinContrato a último segundo del día exacto
  if (this.fechaFinContrato && this.isModified('fechaFinContrato')) {
    const fecha = new Date(this.fechaFinContrato);
    // Crear fecha UTC con el mismo día/mes/año para evitar desfases
    const fechaNormalizada = new Date(Date.UTC(
      fecha.getFullYear(), 
      fecha.getMonth(), 
      fecha.getDate(), 
      23, 59, 59, 999
    ));
    this.fechaFinContrato = fechaNormalizada;
  }

  next();
});

module.exports = mongoose.model('Aprendiz', aprendizSchema);
