const { Router } = require('express');
const controller = require('./auth.controller');
const { auth } = require('../../middleware/auth');

const router = Router();

router.post('/registro', controller.registro);
router.post('/login', controller.login);
router.post('/google', controller.googleAuth);
router.get('/perfil', auth, controller.perfil);

module.exports = router;
