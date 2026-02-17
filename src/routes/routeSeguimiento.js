const express = require('express');
const router = express.Router();
const seguimientoController = require('../controllers/seguimientoController');
const { verificarToken } = require('../middlewares/authMiddleware');

// GET /api/seguimiento/estadisticas - Obtener estadísticas del dashboard
router.get('/estadisticas', seguimientoController.obtenerEstadisticasSeguimiento);

// GET /api/seguimiento/incompletos - Obtener aprendices con datos incompletos
router.get('/incompletos', seguimientoController.obtenerAprendicesIncompletos);

// GET /api/seguimiento/recomendados-reemplazo - Obtener aprendices recomendados para reemplazo
router.get('/recomendados-reemplazo', seguimientoController.obtenerRecomendadosParaReemplazo);

// GET /api/seguimiento/recomendados-contrato - Obtener recomendados por fecha de inicio de contrato
router.get('/recomendados-contrato', seguimientoController.obtenerRecomendadosPorContrato);

// GET /api/seguimiento/historico - Obtener aprendices finalizados (histórico)
router.get('/historico', seguimientoController.obtenerAprendicesHistorico);

// POST /api/seguimiento/actualizar-etapas-automaticas - Actualizar etapas según fechaInicioProductiva
router.post('/actualizar-etapas-automaticas', seguimientoController.actualizarEtapasAutomaticas);

// GET /api/seguimiento - Obtener aprendices para seguimiento con filtros
router.get('/', seguimientoController.obtenerAprendicesSeguimiento);

// GET /api/seguimiento/:id - Obtener detalle de un aprendiz en seguimiento
router.get('/:id', seguimientoController.obtenerDetalleAprendizSeguimiento);

// PUT /api/seguimiento/:id/etapa - Cambiar etapa de un aprendiz
router.put('/:id/etapa', seguimientoController.cambiarEtapaAprendiz);

// PUT /api/seguimiento/:id/reemplazo - Asignar reemplazo a un aprendiz
router.put('/:id/reemplazo', seguimientoController.asignarReemplazo);

// PUT /api/seguimiento/:id/fechas - Actualizar fechas de aprendiz
router.put('/:id/fechas', seguimientoController.actualizarFechasAprendiz);

module.exports = router;
