const mongoose = require("mongoose");

const RolSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    permisos: {
      type: [
        {
          permiso: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Permiso",
            required: true,
          },
          privilegiosAsignados: {
            type: [
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Privilegio",
                required: true,
              },
            ],
          },
        },
      ],
      required: true,
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "El rol debe tener al menos un permiso",
      },
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Rol", RolSchema);
