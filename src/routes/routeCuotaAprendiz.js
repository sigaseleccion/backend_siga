// const express = require('express');
// const router = express.Router();
// const cuotaAprendizController = require('../controllers/cuotaAprendizController');
// const { verificarToken } = require('../middlewares/authMiddleware');

// router.get('/', cuotaAprendizController.obtenerCuota);
// router.get('/historial', cuotaAprendizController.obtenerHistorialCuotas);
// router.post('/', cuotaAprendizController.actualizarCuota);

// module.exports = router;

const express = require('express');
const router = express.Router();
const cuotaAprendizController = require('../controllers/cuotaAprendizController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', cuotaAprendizController.obtenerCuota);
router.get('/historial', cuotaAprendizController.obtenerHistorialCuotas);
router.post('/', cuotaAprendizController.actualizarCuota);
router.put('/', cuotaAprendizController.actualizarCuota);  // Agregar PUT para compatibilidad con frontend

module.exports = router;
