const db = require('../../config/db');
const retosService = require('../../services/retosService');

const CONTENT_MAX_LEN = 1000;
const PAGE_SIZE = 20;

// Elimina tags HTML básicos para prevenir XSS almacenado
function stripHtml(str) {
  return str.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim();
}

function validarId(raw) {
  const id = parseInt(raw, 10);
  if (isNaN(id) || id <= 0) return null;
  return id;
}

// ── Listar publicaciones (con paginación y JOIN en lugar de subquery) ─────────

exports.listarPublicaciones = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(PAGE_SIZE, parseInt(req.query.limit, 10) || PAGE_SIZE);
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `SELECT
         p.id,
         u.nombre   AS usuario,
         u.avatar,
         p.contenido,
         p.likes,
         p.creado_en,
         COALESCE(c.total, 0) AS comentarios
       FROM publicaciones p
       JOIN usuarios u ON p.usuario_id = u.id
       LEFT JOIN (
         SELECT publicacion_id, COUNT(*) AS total FROM comentarios GROUP BY publicacion_id
       ) c ON c.publicacion_id = p.id
       ORDER BY p.creado_en DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM publicaciones');

    res.json({
      data:     rows,
      page,
      pageSize: limit,
      total:    Number(total),
      hasMore:  offset + rows.length < Number(total),
    });
  } catch (err) {
    next(err);
  }
};

// ── Crear publicación ─────────────────────────────────────────────────────────

exports.crearPublicacion = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;
    const contenido = stripHtml(String(req.body.contenido || ''));

    if (!contenido) {
      return res.status(400).json({ error: 'El contenido es requerido' });
    }
    if (contenido.length > CONTENT_MAX_LEN) {
      return res.status(400).json({ error: `El contenido no puede superar ${CONTENT_MAX_LEN} caracteres` });
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query(
        'INSERT INTO publicaciones (usuario_id, contenido) VALUES (?, ?)',
        [usuarioId, contenido]
      );

      await retosService.incrementarProgreso(usuarioId, 'comunidad', 1);

      const [publicacion] = await conn.query(
        `SELECT p.id, u.nombre AS usuario, u.avatar, p.contenido, p.likes, 0 AS comentarios, p.creado_en
         FROM publicaciones p JOIN usuarios u ON p.usuario_id = u.id
         WHERE p.id = ?`,
        [result.insertId]
      );

      await conn.commit();
      res.status(201).json(publicacion[0]);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    next(err);
  }
};

// ── Toggle Like ───────────────────────────────────────────────────────────────

exports.toggleLike = async (req, res, next) => {
  try {
    const pubId    = validarId(req.params.id);
    const usuarioId = req.usuario.id;

    if (!pubId) return res.status(400).json({ error: 'ID de publicación inválido' });

    const [pub] = await db.query('SELECT id FROM publicaciones WHERE id = ?', [pubId]);
    if (pub.length === 0) return res.status(404).json({ error: 'Publicación no encontrada' });

    const [existente] = await db.query(
      'SELECT id FROM publicacion_likes WHERE publicacion_id = ? AND usuario_id = ?',
      [pubId, usuarioId]
    );

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const liked = existente.length === 0;
      if (!liked) {
        await conn.query('DELETE FROM publicacion_likes WHERE id = ?', [existente[0].id]);
        await conn.query('UPDATE publicaciones SET likes = GREATEST(0, likes - 1) WHERE id = ?', [pubId]);
      } else {
        await conn.query(
          'INSERT INTO publicacion_likes (publicacion_id, usuario_id) VALUES (?, ?)',
          [pubId, usuarioId]
        );
        await conn.query('UPDATE publicaciones SET likes = likes + 1 WHERE id = ?', [pubId]);
      }

      const [[{ likes }]] = await conn.query('SELECT likes FROM publicaciones WHERE id = ?', [pubId]);
      await conn.commit();
      res.json({ likes, liked });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    next(err);
  }
};

// ── Listar comentarios ────────────────────────────────────────────────────────

exports.listarComentarios = async (req, res, next) => {
  try {
    const pubId = validarId(req.params.id);
    if (!pubId) return res.status(400).json({ error: 'ID de publicación inválido' });

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

// ── Crear comentario ──────────────────────────────────────────────────────────

exports.crearComentario = async (req, res, next) => {
  try {
    const pubId     = validarId(req.params.id);
    const usuarioId = req.usuario.id;
    const contenido = stripHtml(String(req.body.contenido || ''));

    if (!pubId) return res.status(400).json({ error: 'ID de publicación inválido' });
    if (!contenido) return res.status(400).json({ error: 'El contenido es requerido' });
    if (contenido.length > CONTENT_MAX_LEN) {
      return res.status(400).json({ error: `El contenido no puede superar ${CONTENT_MAX_LEN} caracteres` });
    }

    const [pub] = await db.query('SELECT id FROM publicaciones WHERE id = ?', [pubId]);
    if (pub.length === 0) return res.status(404).json({ error: 'Publicación no encontrada' });

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query(
        'INSERT INTO comentarios (publicacion_id, usuario_id, contenido) VALUES (?, ?, ?)',
        [pubId, usuarioId, contenido]
      );

      await retosService.incrementarProgreso(usuarioId, 'comunidad', 1);

      const [comentario] = await conn.query(
        `SELECT c.id, u.nombre AS usuario, u.avatar, c.contenido, c.creado_en
         FROM comentarios c JOIN usuarios u ON c.usuario_id = u.id
         WHERE c.id = ?`,
        [result.insertId]
      );

      await conn.commit();
      res.status(201).json(comentario[0]);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    next(err);
  }
};
