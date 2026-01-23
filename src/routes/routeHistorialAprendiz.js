const express = require('express');
const router = express.Router();
const historialAprendizController = require('../controllers/historialAprendizController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, historialAprendizController.obtenerHistorial);
router.get('/:id', verificarToken, historialAprendizController.obtenerHistorialPorId);
router.get('/aprendiz/:aprendizId', verificarToken, historialAprendizController.obtenerHistorialPorAprendiz);
router.post('/', verificarToken, historialAprendizController.crearHistorial);
router.put('/:id', verificarToken, historialAprendizController.actualizarHistorial);
router.delete('/:id', verificarToken, historialAprendizController.eliminarHistorial);

module.exports = router;
