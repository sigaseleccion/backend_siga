const express = require('express');
const router = express.Router();
const rolController = require('../controllers/rolController');
const { verificarToken, autorizar } = require('../middlewares/authMiddleware');

router.post('/', verificarToken, autorizar('roles', 'crear'), rolController.crearRol);
router.get('/', verificarToken, autorizar('roles', 'ver'), rolController.listarRoles);
router.get('/:id', verificarToken, autorizar('roles', 'ver'), rolController.obtenerRolPorId);
router.put('/:id', verificarToken, autorizar('roles', 'editar'), rolController.actualizarRol);
router.delete('/:id', verificarToken, autorizar('roles', 'eliminar'), rolController.eliminarRol);

module.exports = router;
