const { Router } = require('express');
const controller = require('./comunidad.controller');
const { auth } = require('../../middleware/auth');

const router = Router();

// Publicaciones
router.get('/publicaciones', controller.listarPublicaciones);
router.post('/publicaciones', auth, controller.crearPublicacion);
router.post('/publicaciones/:id/like', auth, controller.toggleLike);

// Comentarios
router.get('/publicaciones/:id/comentarios', controller.listarComentarios);
router.post('/publicaciones/:id/comentarios', auth, controller.crearComentario);

module.exports = router;
