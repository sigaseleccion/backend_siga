const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, usuarioController.obtenerUsuarios);
router.get('/:id', verificarToken, usuarioController.obtenerUsuarioPorId);
router.post('/', verificarToken, usuarioController.crearUsuario);
router.put('/:id', verificarToken, usuarioController.actualizarUsuario);
router.delete('/:id', verificarToken, usuarioController.eliminarUsuario);

module.exports = router;
