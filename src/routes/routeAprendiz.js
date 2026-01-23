const express = require('express');
const router = express.Router();
const aprendizController = require('../controllers/aprendizController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, aprendizController.obtenerAprendices);
router.get('/:id', verificarToken, aprendizController.obtenerAprendizPorId);
router.get('/convocatoria/:convocatoriaId', verificarToken, aprendizController.obtenerAprendicesPorConvocatoria);
router.post('/', verificarToken, aprendizController.crearAprendiz);
router.put('/:id', verificarToken, aprendizController.actualizarAprendiz);
router.delete('/:id', verificarToken, aprendizController.eliminarAprendiz);

module.exports = router;
