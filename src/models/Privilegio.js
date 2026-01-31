const mongoose = require('mongoose');

const PrivilegioSchema = new mongoose.Schema({
  clave: {
    type: String,
    required: true,
    unique: true
  },
  etiqueta: {
    type: String
  }
});

module.exports = mongoose.model("Privilegio", PrivilegioSchema);
