const db = require('../../config/db');

exports.topAprendices = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nombre, avatar, puntos, nivel, frase FROM usuarios ORDER BY puntos DESC LIMIT 5'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.stats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT puntos, dias_seguidos, palabras_aprendidas FROM usuarios WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const [modulos] = await db.query(
      'SELECT COUNT(*) AS total FROM modulos'
    );

    res.json({
      puntos: rows[0].puntos,
      dias_seguidos: rows[0].dias_seguidos,
      palabras_aprendidas: rows[0].palabras_aprendidas,
      modulos_total: modulos[0].total
    });
  } catch (err) {
    next(err);
  }
};

exports.miembrosActivos = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) AS total FROM usuarios');
    res.json({ total: rows[0].total });
  } catch (err) {
    next(err);
  }
};
