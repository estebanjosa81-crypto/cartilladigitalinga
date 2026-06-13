const { Router } = require('express');
const ctrl = require('./vocabulario.controller');

const router = Router();

router.get('/buscar', ctrl.buscar);

module.exports = router;
