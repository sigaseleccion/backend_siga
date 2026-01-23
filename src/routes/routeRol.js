const express = require('express');
const router = express.Router();
const rolController = require('../controllers/rolController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, rolController.obtenerRoles);
router.get('/:id', verificarToken, rolController.obtenerRolPorId);
router.post('/', verificarToken, rolController.crearRol);
router.put('/:id', verificarToken, rolController.actualizarRol);
router.delete('/:id', verificarToken, rolController.eliminarRol);

module.exports = router;
