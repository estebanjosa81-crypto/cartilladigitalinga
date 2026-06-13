const { Router } = require('express');
const ctrl = require('./secciones.controller');

const router = Router();

router.get('/banner',   ctrl.getBannerSlides);
router.get('/activas',  ctrl.getActivas);
router.get('/:tipo',    ctrl.getByTipo);

module.exports = router;
