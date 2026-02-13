const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.post('/login', authController.login);
router.get('/verificar', verificarToken, authController.verificarToken);
router.post("/solicitar-codigo", authController.solicitarCodigoRecuperacion);
router.post("/verificar-codigo", authController.verificarCodigoRecuperacion);
router.post("/restablecer-contrasena", authController.restablecerContrasena);
module.exports = router;
