const Permiso = require('../models/Permiso');
const Privilegio = require('../models/Privilegio');

const listarPermisos = async (req, res) => {
  try {
    const permisos = await Permiso.find()
      .populate('privilegiosDisponibles')
      .sort({ modulo: 1 });

    res.json(permisos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar permisos' });
  }
};

const obtenerPermisoPorModulo = async (req, res) => {
  try {
    const { modulo } = req.params;

    const permiso = await Permiso.findOne({ modulo })
      .populate('privilegiosDisponibles');

    if (!permiso) {
      return res.status(404).json({ mensaje: 'Permiso no encontrado' });
    }

    res.json(permiso);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener permiso' });
  }
};

const crearPermiso = async (req, res) => {
  try {
    const { modulo, privilegiosDisponibles } = req.body;

    if (!modulo) {
      return res.status(400).json({ mensaje: 'El nombre del módulo es obligatorio' });
    }

    const existe = await Permiso.findOne({ modulo });
    if (existe) {
      return res.status(400).json({ mensaje: 'El permiso ya existe' });
    }

    if (privilegiosDisponibles?.length) {
      const cantidad = await Privilegio.countDocuments({
        _id: { $in: privilegiosDisponibles }
      });

      if (cantidad !== privilegiosDisponibles.length) {
        return res.status(400).json({
          mensaje: 'Privilegios inválidos'
        });
      }
    }

    const permiso = await Permiso.create({
      modulo,
      privilegiosDisponibles
    });

    res.status(201).json(permiso);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear permiso' });
  }
};

module.exports = {
  listarPermisos,
  obtenerPermisoPorModulo,
  crearPermiso
};
