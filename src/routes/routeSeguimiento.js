const express = require('express');
const router = express.Router();
const seguimientoController = require('../controllers/seguimientoController');
const { verificarToken } = require('../middlewares/authMiddleware');

// GET /api/seguimiento - Obtener aprendices para seguimiento con filtros
router.get('/',  seguimientoController.obtenerAprendicesSeguimiento);

// GET /api/seguimiento/estadisticas - Obtener estadísticas del dashboard
router.get('/estadisticas',  seguimientoController.obtenerEstadisticasSeguimiento);

// GET /api/seguimiento/incompletos - Obtener aprendices con datos incompletos
router.get('/incompletos',  seguimientoController.obtenerAprendicesIncompletos);

// GET /api/seguimiento/:id - Obtener detalle de un aprendiz en seguimiento
router.get('/:id',  seguimientoController.obtenerDetalleAprendizSeguimiento);

// PUT /api/seguimiento/:id/etapa - Cambiar etapa de un aprendiz
router.put('/:id/etapa',  seguimientoController.cambiarEtapaAprendiz);

// PUT /api/seguimiento/:id/reemplazo - Asignar reemplazo a un aprendiz
router.put('/:id/reemplazo',  seguimientoController.asignarReemplazo);

module.exports = router;
