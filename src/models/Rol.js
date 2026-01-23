const mongoose = require('mongoose');

const rolSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  permisos: {
    convocatorias: {
      ver: { type: Boolean, default: false },
      crear: { type: Boolean, default: false },
      editar: { type: Boolean, default: false },
      cargarExcelAdicional: { type: Boolean, default: false }
    },
    seleccion: {
      ver: { type: Boolean, default: false },
      crear: { type: Boolean, default: false },
      editar: { type: Boolean, default: false },
      gestionReporteTecnico: { type: Boolean, default: false }
    },
    seguimiento: {
      ver: { type: Boolean, default: false },
      crear: { type: Boolean, default: false },
      editar: { type: Boolean, default: false }
    },
    roles: {
      ver: { type: Boolean, default: false },
      crear: { type: Boolean, default: false },
      editar: { type: Boolean, default: false }
    },
    historial: {
      ver: { type: Boolean, default: false },
      crear: { type: Boolean, default: false },
      editar: { type: Boolean, default: false }
    },
    usuarios: {
      ver: { type: Boolean, default: false },
      crear: { type: Boolean, default: false },
      editar: { type: Boolean, default: false }
    }
  },
  activo: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Rol', rolSchema);
