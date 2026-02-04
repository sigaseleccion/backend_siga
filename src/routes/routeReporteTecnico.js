const express = require('express');
const router = express.Router();
const reporteTecnicoController = require('../controllers/reporteTecnicoController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', reporteTecnicoController.obtenerReportes);
router.get('/:id',  reporteTecnicoController.obtenerReportePorId);
router.get('/convocatoria/:convocatoriaId',  reporteTecnicoController.obtenerReportesPorConvocatoria);
router.post('/',  reporteTecnicoController.crearReporte);
router.put('/:id',  reporteTecnicoController.actualizarReporte);
router.delete('/:id', reporteTecnicoController.eliminarReporte);

module.exports = router;
