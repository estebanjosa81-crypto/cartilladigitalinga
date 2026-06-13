const { Router } = require('express');
const controller = require('./modulos.controller');
const { auth, authOpcional } = require('../../middleware/auth');

const router = Router();

router.get('/', controller.listar);
router.get('/:clave', controller.obtener);
router.post('/:clave/responder', auth, controller.responder);
router.get('/:clave/progreso', auth, controller.progreso);

module.exports = router;
