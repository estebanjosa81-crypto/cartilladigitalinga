const db = require('../../config/db');

exports.getBannerSlides = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT id, titulo, subtitulo, imagen_url, imagen_alt, link_url, orden FROM cartilla_secciones WHERE tipo = 'banner' AND activo = TRUE ORDER BY orden ASC"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getByTipo = async (req, res, next) => {
  const TIPOS_VALIDOS = ['banner', 'portada', 'presentacion', 'modulo', 'galeria', 'cierre'];
  const { tipo } = req.params;
  if (!TIPOS_VALIDOS.includes(tipo)) return res.status(400).json({ error: 'Tipo inválido' });
  try {
    const [rows] = await db.query(
      'SELECT id, titulo, subtitulo, contenido, imagen_url, imagen_alt, link_url, orden, tipo FROM cartilla_secciones WHERE tipo = ? AND activo = TRUE ORDER BY orden ASC',
      [tipo]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getActivas = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT id, titulo, subtitulo, contenido, imagen_url, imagen_alt, link_url, orden, tipo FROM cartilla_secciones WHERE tipo != 'banner' AND activo = TRUE ORDER BY orden ASC"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
