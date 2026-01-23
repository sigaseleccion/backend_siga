const express = require('express');
const router = express.Router();
const pruebaSeleccionController = require('../controllers/pruebaSeleccionController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, pruebaSeleccionController.obtenerPruebas);
router.get('/:id', verificarToken, pruebaSeleccionController.obtenerPruebaPorId);
router.get('/aprendiz/:aprendizId', verificarToken, pruebaSeleccionController.obtenerPruebasPorAprendiz);
router.post('/', verificarToken, pruebaSeleccionController.crearPrueba);
router.put('/:id', verificarToken, pruebaSeleccionController.actualizarPrueba);
router.delete('/:id', verificarToken, pruebaSeleccionController.eliminarPrueba);

module.exports = router;
