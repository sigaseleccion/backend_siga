const express = require('express');
const router = express.Router();

// Importar rutas
const routeAuth = require('./routeAuth');
const routeUsuario = require('./routeUsuario');
const routeRol = require('./routeRol');
const routePrivilegio = require('./routePrivilegio')
const routePermiso = require('./routePermiso')
const routeConvocatoria = require('./routeConvocatoria');
const routeAprendiz = require('./routeAprendiz');
const routePruebaSeleccion = require('./routePruebaSeleccion');
const routeReporteTecnico = require('./routeReporteTecnico');
const routeHistorialAprendiz = require('./routeHistorialAprendiz');
const routeCuotaAprendiz = require('./routeCuotaAprendiz');
const routeSeguimiento = require('./routeSeguimiento');

// Usar rutas
router.use('/auth', routeAuth);
router.use('/usuarios', routeUsuario);
router.use('/roles', routeRol);
router.use('/privilegios', routePrivilegio)
router.use('/permisos', routePermiso)
router.use('/convocatorias', routeConvocatoria);
router.use('/aprendices', routeAprendiz);
router.use('/pruebas-seleccion', routePruebaSeleccion);
router.use('/reportes-tecnicos', routeReporteTecnico);
router.use('/historial-aprendices', routeHistorialAprendiz);
router.use('/cuota-aprendices', routeCuotaAprendiz);
router.use('/seguimiento', routeSeguimiento);

module.exports = router;
