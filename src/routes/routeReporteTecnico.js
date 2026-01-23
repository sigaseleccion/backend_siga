const express = require('express');
const router = express.Router();
const reporteTecnicoController = require('../controllers/reporteTecnicoController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, reporteTecnicoController.obtenerReportes);
router.get('/:id', verificarToken, reporteTecnicoController.obtenerReportePorId);
router.get('/convocatoria/:convocatoriaId', verificarToken, reporteTecnicoController.obtenerReportesPorConvocatoria);
router.post('/', verificarToken, reporteTecnicoController.crearReporte);
router.put('/:id', verificarToken, reporteTecnicoController.actualizarReporte);
router.delete('/:id', verificarToken, reporteTecnicoController.eliminarReporte);

module.exports = router;
