const express = require('express');
const router = express.Router();
const privilegioController = require('../controllers/privilegioController');
const { verificarToken, autorizar } = require('../middlewares/authMiddleware');

router.get('/', /* verificarToken, autorizar('privilegios', 'ver'), */ privilegioController.listarPrivilegios);
router.post('/', /* verificarToken, autorizar('privilegios', 'crear'), */ privilegioController.crearPrivilegio);

module.exports = router;