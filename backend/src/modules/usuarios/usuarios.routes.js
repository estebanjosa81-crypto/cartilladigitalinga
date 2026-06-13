const { Router } = require('express');
const controller = require('./usuarios.controller');

const router = Router();

router.get('/top', controller.topAprendices);
router.get('/activos', controller.miembrosActivos);
router.get('/:id/stats', controller.stats);

module.exports = router;
