const express = require('express');
const router = express.Router();
const convocatoriaController = require('../controllers/convocatoriaController');
const { verificarToken } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/upload');

// Rutas de convocatorias
router.get('/', /*verificarToken*/  convocatoriaController.obtenerConvocatorias);
router.get('/archivadas', /*verificarToken*/  convocatoriaController.obtenerConvocatoriasArchivadas);
router.get('/:id', /*verificarToken*/  convocatoriaController.obtenerConvocatoriaPorId);
router.post('/', /*verificarToken*/  convocatoriaController.crearConvocatoria);
router.post('/crear-con-aprendices', /*verificarToken*/  convocatoriaController.crearConvocatoriaConAprendices);
router.post('/:id/cargar-excel-adicional', /*verificarToken*/  convocatoriaController.cargarExcelAdicional);
router.put('/:id', /*verificarToken*/  convocatoriaController.actualizarConvocatoria);
router.patch('/:id/cerrar', /*verificarToken*/  convocatoriaController.cerrarConvocatoria);
router.patch('/:id/reabrir', /*verificarToken*/  convocatoriaController.reabrirConvocatoria);
router.patch('/:id/archivar', /*verificarToken*/  convocatoriaController.archivarConvocatoria);
router.post('/:convocatoriaId/reporte', /*verificarToken*/ upload.single('file'), convocatoriaController.subirReporteTecnico);

module.exports = router;
