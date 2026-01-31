const mongoose = require('mongoose');

const PermisoSchema = new mongoose.Schema({
  modulo: {
    type: String,
    required: true,
    unique: true
  },
  privilegiosDisponibles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Privilegio'
  }]
});

module.exports = mongoose.model("Permiso", PermisoSchema);
