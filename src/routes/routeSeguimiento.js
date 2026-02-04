const express = require('express');
const router = express.Router();
const seguimientoController = require('../controllers/seguimientoController');
const { verificarToken } = require('../middlewares/authMiddleware');

// GET /api/seguimiento - Obtener aprendices para seguimiento con filtros
router.get('/', verificarToken, seguimientoController.obtenerAprendicesSeguimiento);

// GET /api/seguimiento/estadisticas - Obtener estadísticas del dashboard
router.get('/estadisticas', verificarToken, seguimientoController.obtenerEstadisticasSeguimiento);

// GET /api/seguimiento/incompletos - Obtener aprendices con datos incompletos
router.get('/incompletos', verificarToken, seguimientoController.obtenerAprendicesIncompletos);

// GET /api/seguimiento/:id - Obtener detalle de un aprendiz en seguimiento
router.get('/:id', verificarToken, seguimientoController.obtenerDetalleAprendizSeguimiento);

// PUT /api/seguimiento/:id/etapa - Cambiar etapa de un aprendiz
router.put('/:id/etapa', verificarToken, seguimientoController.cambiarEtapaAprendiz);

// PUT /api/seguimiento/:id/reemplazo - Asignar reemplazo a un aprendiz
router.put('/:id/reemplazo', verificarToken, seguimientoController.asignarReemplazo);

module.exports = router;
