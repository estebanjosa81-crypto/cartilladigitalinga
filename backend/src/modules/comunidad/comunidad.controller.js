const db = require('../../config/db');
const retosService = require('../../services/retosService');

exports.listarPublicaciones = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT
        p.id,
        u.nombre AS usuario,
        u.avatar,
        p.contenido,
        p.likes,
        (SELECT COUNT(*) FROM comentarios c WHERE c.publicacion_id = p.id) AS comentarios,
        p.creado_en
      FROM publicaciones p
      JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.creado_en DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.crearPublicacion = async (req, res, next) => {
  try {
    const { contenido } = req.body;
    const usuarioId = req.usuario.id;

    if (!contenido || !contenido.trim()) {
      return res.status(400).json({ error: 'El contenido es requerido' });
    }

    const [result] = await db.query(
      'INSERT INTO publicaciones (usuario_id, contenido) VALUES (?, ?)',
      [usuarioId, contenido.trim()]
    );

    // Incrementar progreso del reto de comunidad
    await retosService.incrementarProgreso(usuarioId, 'comunidad', 1);

    const [publicacion] = await db.query(
      `SELECT p.id, u.nombre AS usuario, u.avatar, p.contenido, p.likes, 0 AS comentarios, p.creado_en
       FROM publicaciones p JOIN usuarios u ON p.usuario_id = u.id
       WHERE p.id = ?`,
      [result.insertId]
    );

    res.status(201).json(publicacion[0]);
  } catch (err) {
    next(err);
  }
};

exports.toggleLike = async (req, res, next) => {
  try {
    const pubId = parseInt(req.params.id);
    const usuarioId = req.usuario.id;

    // Verificar publicación
    const [pub] = await db.query('SELECT id FROM publicaciones WHERE id = ?', [pubId]);
    if (pub.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    // Verificar si ya dio like
    const [existente] = await db.query(
      'SELECT id FROM publicacion_likes WHERE publicacion_id = ? AND usuario_id = ?',
      [pubId, usuarioId]
    );

    if (existente.length > 0) {
      // Quitar like
      await db.query('DELETE FROM publicacion_likes WHERE id = ?', [existente[0].id]);
      await db.query('UPDATE publicaciones SET likes = GREATEST(0, likes - 1) WHERE id = ?', [pubId]);
    } else {
      // Dar like
      await db.query(
        'INSERT INTO publicacion_likes (publicacion_id, usuario_id) VALUES (?, ?)',
        [pubId, usuarioId]
      );
      await db.query('UPDATE publicaciones SET likes = likes + 1 WHERE id = ?', [pubId]);
    }

    const [actualizada] = await db.query('SELECT likes FROM publicaciones WHERE id = ?', [pubId]);
    res.json({ likes: actualizada[0].likes, liked: existente.length === 0 });
  } catch (err) {
    next(err);
  }
};

exports.listarComentarios = async (req, res, next) => {
  try {
    const pubId = parseInt(req.params.id);
    const [rows] = await db.query(
      `SELECT c.id, u.nombre AS usuario, u.avatar, c.contenido, c.creado_en
       FROM comentarios c
       JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.publicacion_id = ?
       ORDER BY c.creado_en ASC`,
      [pubId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.crearComentario = async (req, res, next) => {
  try {
    const pubId = parseInt(req.params.id);
    const usuarioId = req.usuario.id;
    const { contenido } = req.body;

    if (!contenido || !contenido.trim()) {
      return res.status(400).json({ error: 'El contenido es requerido' });
    }

    const [pub] = await db.query('SELECT id FROM publicaciones WHERE id = ?', [pubId]);
    if (pub.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    const [result] = await db.query(
      'INSERT INTO comentarios (publicacion_id, usuario_id, contenido) VALUES (?, ?, ?)',
      [pubId, usuarioId, contenido.trim()]
    );

    // Incrementar progreso del reto de comunidad
    await retosService.incrementarProgreso(usuarioId, 'comunidad', 1);

    const [comentario] = await db.query(
      `SELECT c.id, u.nombre AS usuario, u.avatar, c.contenido, c.creado_en
       FROM comentarios c JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.id = ?`,
      [result.insertId]
    );

    res.status(201).json(comentario[0]);
  } catch (err) {
    next(err);
  }
};
