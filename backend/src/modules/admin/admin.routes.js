const { Router } = require('express');
const { auth, adminOnly } = require('../../middleware/auth');
const ctrl = require('./admin.controller');

const router = Router();

// Todas las rutas requieren auth + role admin
router.use(auth, adminOnly);

// Dashboard
router.get('/stats', ctrl.getStats);

// Usuarios
router.get('/usuarios',       ctrl.listarUsuarios);
router.put('/usuarios/:id',   ctrl.actualizarUsuario);
router.delete('/usuarios/:id',ctrl.eliminarUsuario);

// Módulos
router.get('/modulos',         ctrl.listarModulos);
router.post('/modulos',        ctrl.crearModulo);
router.put('/modulos/:id',     ctrl.actualizarModulo);
router.delete('/modulos/:id',  ctrl.eliminarModulo);

// Actividad de un módulo (legacy — mantiene compatibilidad)
router.get('/modulos/:id/actividad', ctrl.getActividad);
router.put('/modulos/:id/actividad', ctrl.actualizarActividad);

// Actividades V2 — múltiples por módulo
router.get('/modulos/:id/actividades',            ctrl.listarActividadesModulo);
router.post('/modulos/:id/actividades',           ctrl.crearActividad);
router.put('/modulos/:id/actividades/:actId',     ctrl.actualizarActividadV2);
router.delete('/modulos/:id/actividades/:actId',  ctrl.eliminarActividad);

// Imágenes del módulo
router.get('/modulos/:id/imagenes',              ctrl.listarImagenesModulo);
router.post('/modulos/:id/imagenes',             ctrl.crearImagenModulo);
router.put('/modulos/:id/imagenes/:imgId',       ctrl.actualizarImagenModulo);
router.delete('/modulos/:id/imagenes/:imgId',    ctrl.eliminarImagenModulo);

// Secciones de contenido del módulo
router.get('/modulos/:id/secciones-contenido',           ctrl.listarSeccionesModulo);
router.post('/modulos/:id/secciones-contenido',          ctrl.crearSeccionModulo);
router.put('/modulos/:id/secciones-contenido/:secId',    ctrl.actualizarSeccionModulo);
router.delete('/modulos/:id/secciones-contenido/:secId', ctrl.eliminarSeccionModulo);

// Audios del módulo
router.get('/modulos/:id/audios',              ctrl.listarAudiosModulo);
router.post('/modulos/:id/audios',             ctrl.crearAudioModulo);
router.put('/modulos/:id/audios/:audId',       ctrl.actualizarAudioModulo);
router.delete('/modulos/:id/audios/:audId',    ctrl.eliminarAudioModulo);

// Comunidad
router.get('/publicaciones',         ctrl.listarPublicaciones);
router.delete('/publicaciones/:id',  ctrl.eliminarPublicacion);

// Banco de Conocimiento — Vocabulario
router.get('/banco/vocabulario',           ctrl.listarVocabulario);
router.post('/banco/vocabulario',          ctrl.crearVocabulario);
router.post('/banco/vocabulario/importar', ctrl.importarVocabulario);
router.put('/banco/vocabulario/:id',       ctrl.actualizarVocabulario);
router.delete('/banco/vocabulario/:id',    ctrl.eliminarVocabulario);

// Banco de Conocimiento — Textos culturales
router.get('/banco/textos',        ctrl.listarTextos);
router.post('/banco/textos',       ctrl.crearTexto);
router.put('/banco/textos/:id',    ctrl.actualizarTexto);
router.delete('/banco/textos/:id', ctrl.eliminarTexto);

// Configuración general
router.get('/configuracion', ctrl.getConfiguracion);
router.put('/configuracion', ctrl.actualizarConfiguracion);

// Upload (Cloudinary)
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
router.post('/upload/imagen', upload.single('imagen'), ctrl.uploadImagen);
router.post('/upload/audio',  upload.single('audio'),  ctrl.uploadAudio);

// Secciones de la cartilla digital
router.get('/secciones',            ctrl.listarSecciones);
router.post('/secciones',           ctrl.crearSeccion);
router.put('/secciones/reordenar',  ctrl.reordenarSecciones);
router.put('/secciones/:id',        ctrl.actualizarSeccion);
router.delete('/secciones/:id',     ctrl.eliminarSeccion);

module.exports = router;
