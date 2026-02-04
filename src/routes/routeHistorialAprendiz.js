const express = require('express');
const router = express.Router();
const historialAprendizController = require('../controllers/historialAprendizController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/',  historialAprendizController.obtenerHistorial);
router.get('/:id',  historialAprendizController.obtenerHistorialPorId);
router.get('/aprendiz/:aprendizId',  historialAprendizController.obtenerHistorialPorAprendiz);
router.post('/',  historialAprendizController.crearHistorial);
router.put('/:id',  historialAprendizController.actualizarHistorial);
router.delete('/:id',  historialAprendizController.eliminarHistorial);

module.exports = router;
