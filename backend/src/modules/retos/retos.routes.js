const { Router } = require('express');
const controller = require('./retos.controller');
const { authOpcional } = require('../../middleware/auth');

const router = Router();

// Los retos se completan automáticamente según las acciones del usuario
// No hay endpoint de toggle manual
router.get('/', authOpcional, controller.listar);

module.exports = router;
