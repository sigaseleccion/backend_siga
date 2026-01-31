const mongoose = require('mongoose');

const RolSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true
  },
  permisos: [{
    permiso: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Permiso"
    },
    privilegiosAsignados: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Privilegio"
    }]
  }],
  activo: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model("Rol", RolSchema);