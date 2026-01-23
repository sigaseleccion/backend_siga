const express = require('express');
const router = express.Router();
const convocatoriaController = require('../controllers/convocatoriaController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, convocatoriaController.obtenerConvocatorias);
router.get('/:id', verificarToken, convocatoriaController.obtenerConvocatoriaPorId);
router.post('/', verificarToken, convocatoriaController.crearConvocatoria);
router.put('/:id', verificarToken, convocatoriaController.actualizarConvocatoria);
router.patch('/:id/archivar', verificarToken, convocatoriaController.archivarConvocatoria);

module.exports = router;
