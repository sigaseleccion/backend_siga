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

// Obtener cuota más reciente
router.get('/', cuotaAprendizController.obtenerCuota);

// Obtener historial de cuotas
router.get('/historial', cuotaAprendizController.obtenerHistorialCuotas);

// Obtener cuotas futuras (para edición)
router.get('/futuras', cuotaAprendizController.obtenerCuotasFuturas);

// Crear nueva cuota
router.post('/', verificarToken, cuotaAprendizController.actualizarCuota);

// Obtener cuota por ID
router.get('/:id', cuotaAprendizController.obtenerCuotaPorId);

// Editar cuota existente
router.put('/:id', verificarToken, cuotaAprendizController.editarCuota);

// Actualizar cantidad de aprendices
router.patch('/:id/cantidad', verificarToken, cuotaAprendizController.actualizarCantidadAprendices);

// Eliminar cuota
router.delete('/:id', verificarToken, cuotaAprendizController.eliminarCuota);

module.exports = router;
