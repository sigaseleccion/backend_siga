const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken, autorizar } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, autorizar('usuarios', 'ver'), usuarioController.obtenerUsuarios);
router.get('/:id', verificarToken, autorizar('usuarios', 'ver'), usuarioController.obtenerUsuarioPorId);
router.post('/', verificarToken, autorizar('usuarios', 'crear'), usuarioController.crearUsuario);
router.put('/:id', verificarToken, autorizar('usuarios', 'editar'), usuarioController.actualizarUsuario);
router.delete('/:id', verificarToken, autorizar('usuarios', 'eliminar'), usuarioController.eliminarUsuario);

module.exports = router;
