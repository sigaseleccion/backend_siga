const mongoose = require('mongoose');

const reporteTecnicoSchema = new mongoose.Schema({
  convocatoriaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Convocatoria',
    required: true
  },
  nombreArchivo: {
    type: String,
    required: true,
    trim: true
  },
  tipoArchivo: {
    type: String,
    enum: ['xlsx', 'xls', 'pdf'],
    required: true
  },
  tamanoArchivo: {
    type: Number,
    required: true
  },
  rutaArchivo: {
    type: String,
    required: true
  },
  fechaSubida: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ReporteTecnico', reporteTecnicoSchema);
