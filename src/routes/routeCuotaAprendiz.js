const express = require('express');
const router = express.Router();
const cuotaAprendizController = require('../controllers/cuotaAprendizController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', cuotaAprendizController.obtenerCuota);
router.get('/historial', cuotaAprendizController.obtenerHistorialCuotas);
router.post('/', cuotaAprendizController.actualizarCuota);

module.exports = router;
