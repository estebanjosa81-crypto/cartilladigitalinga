const db = require('../../config/db');

exports.buscar = async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    const termino = q.trim();

    if (!termino || termino.length < 2) {
      return res.json({ resultados: [], total: 0 });
    }

    const like = `%${termino}%`;

    const [rows] = await db.query(
      `SELECT id, espanol, inga, categoria, notas
       FROM banco_vocabulario
       WHERE espanol LIKE ? OR inga LIKE ?
       ORDER BY
         CASE
           WHEN espanol = ? OR inga = ? THEN 0
           WHEN espanol LIKE ? OR inga LIKE ? THEN 1
           ELSE 2
         END,
         espanol ASC
       LIMIT 30`,
      [like, like, termino, termino, `${termino}%`, `${termino}%`]
    );

    const resultados = rows.map(row => ({
      ...row,
      // Indica qué columna coincide con el término buscado
      coincide: row.espanol.toLowerCase().includes(termino.toLowerCase()) ? 'espanol' : 'inga',
    }));

    res.json({ resultados, total: resultados.length });
  } catch (err) {
    next(err);
  }
};
