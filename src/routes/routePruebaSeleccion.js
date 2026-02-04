const express = require('express');
const router = express.Router();
const pruebaSeleccionController = require('../controllers/pruebaSeleccionController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', pruebaSeleccionController.obtenerPruebas);
router.get('/:id', /*verificarToken*/ pruebaSeleccionController.obtenerPruebaPorId);
router.get('/aprendiz/:aprendizId', /*verificarToken*/ pruebaSeleccionController.obtenerPruebasPorAprendiz);
router.post('/', pruebaSeleccionController.crearPrueba);
router.put('/:id', /*verificarToken*/ pruebaSeleccionController.actualizarPrueba);
router.delete('/:id', pruebaSeleccionController.eliminarPrueba);

module.exports = router;
