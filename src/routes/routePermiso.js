const express = require('express');
const router = express.Router();
const permisoController = require('../controllers/permisoController');
const { verificarToken, autorizar } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, autorizar('permisos', 'ver'), permisoController.listarPermisos);
router.get('/', verificarToken, autorizar('permisos', 'ver'), permisoController.obtenerPermisoPorModulo);
router.post('/', verificarToken, autorizar('permisos', 'crear'), permisoController.crearPermiso);

module.exports = router;