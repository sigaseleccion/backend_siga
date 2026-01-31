const Privilegio = require('../models/Privilegio');

const listarPrivilegios = async (req, res) => {
  try {
    const privilegios = await Privilegio.find().sort({ clave: 1 });
    res.json(privilegios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al listar privilegios' });
  }
};

const crearPrivilegio = async (req, res) => {
  try {
    const { clave, etiqueta } = req.body;

    const existe = await Privilegio.findOne({ clave });
    if (existe) {
      return res.status(400).json({ mensaje: 'El privilegio ya existe' });
    }

    const privilegio = await Privilegio.create({ clave, etiqueta });
    res.status(201).json(privilegio);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear privilegio' });
  }
};

module.exports = {
  listarPrivilegios,
  crearPrivilegio
};
