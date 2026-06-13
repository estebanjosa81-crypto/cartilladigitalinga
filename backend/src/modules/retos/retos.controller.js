const db = require('../../config/db');

exports.listar = async (req, res, next) => {
  try {
    const usuarioId = req.usuario?.id;

    if (usuarioId) {
      // Usuario autenticado: traer retos con progreso del día
      const [rows] = await db.query(
        `SELECT
          r.id, r.titulo, r.descripcion, r.puntos, r.dificultad, r.categoria, r.meta,
          COALESCE(ur.completado, FALSE) AS completado,
          COALESCE(ur.actual, 0) AS actual,
          COALESCE(ur.progreso, 0) AS progreso
        FROM retos r
        LEFT JOIN usuario_retos ur ON r.id = ur.reto_id AND ur.usuario_id = ? AND ur.fecha = CURDATE()
        WHERE r.activo = TRUE
        ORDER BY r.id`,
        [usuarioId]
      );

      // MySQL devuelve 0/1 para boolean; convertir
      const retos = rows.map(r => ({
        ...r,
        completado: Boolean(r.completado)
      }));

      return res.json(retos);
    }

    // Sin autenticación: retos base sin progreso
    const [rows] = await db.query(
      'SELECT id, titulo, descripcion, puntos, dificultad, categoria, meta FROM retos WHERE activo = TRUE ORDER BY id'
    );

    const retos = rows.map(r => ({
      ...r,
      completado: false,
      actual: 0,
      progreso: 0
    }));

    res.json(retos);
  } catch (err) {
    next(err);
  }
};
