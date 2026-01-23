const express = require('express');
const router = express.Router();
const cuotaAprendizController = require('../controllers/cuotaAprendizController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, cuotaAprendizController.obtenerCuota);
router.get('/historial', verificarToken, cuotaAprendizController.obtenerHistorialCuotas);
router.post('/', verificarToken, cuotaAprendizController.actualizarCuota);

module.exports = router;
