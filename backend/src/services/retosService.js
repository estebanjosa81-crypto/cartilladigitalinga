const db = require('../config/db');

/**
 * Incrementa el progreso de un reto por categoría
 * @param {number} usuarioId - ID del usuario
 * @param {string} categoria - Categoría del reto: 'vocabulario' | 'conversacion' | 'modulo' | 'comunidad'
 * @param {number} cantidad - Cantidad a incrementar (default: 1)
 */
async function incrementarProgreso(usuarioId, categoria, cantidad = 1) {
  const hoy = new Date().toISOString().slice(0, 10);

  // Obtener retos activos de esta categoría
  const [retos] = await db.query(
    'SELECT id, puntos, meta FROM retos WHERE categoria = ? AND activo = TRUE',
    [categoria]
  );

  for (const reto of retos) {
    // Verificar si ya existe registro para hoy
    const [existente] = await db.query(
      'SELECT * FROM usuario_retos WHERE usuario_id = ? AND reto_id = ? AND fecha = ?',
      [usuarioId, reto.id, hoy]
    );

    const meta = reto.meta || 1;

    if (existente.length === 0) {
      // Crear nuevo registro
      const nuevoActual = Math.min(cantidad, meta);
      const progreso = Math.round((nuevoActual / meta) * 100);
      const completado = nuevoActual >= meta;

      await db.query(
        `INSERT INTO usuario_retos (usuario_id, reto_id, fecha, completado, actual, progreso, completado_en)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [usuarioId, reto.id, hoy, completado, nuevoActual, progreso, completado ? new Date() : null]
      );

      // Si se completó, dar puntos
      if (completado) {
        await db.query('UPDATE usuarios SET puntos = puntos + ? WHERE id = ?', [reto.puntos, usuarioId]);
      }
    } else {
      const registro = existente[0];

      // Si ya está completado, no hacer nada
      if (registro.completado) continue;

      // Incrementar progreso
      const nuevoActual = Math.min(registro.actual + cantidad, meta);
      const progreso = Math.round((nuevoActual / meta) * 100);
      const completado = nuevoActual >= meta;

      await db.query(
        `UPDATE usuario_retos
         SET actual = ?, progreso = ?, completado = ?, completado_en = ?
         WHERE id = ?`,
        [nuevoActual, progreso, completado, completado ? new Date() : null, registro.id]
      );

      // Si se completó ahora, dar puntos
      if (completado) {
        await db.query('UPDATE usuarios SET puntos = puntos + ? WHERE id = ?', [reto.puntos, usuarioId]);
      }
    }
  }
}

/**
 * Obtiene los puntos actuales del usuario
 */
async function obtenerPuntosUsuario(usuarioId) {
  const [rows] = await db.query('SELECT puntos FROM usuarios WHERE id = ?', [usuarioId]);
  return rows.length > 0 ? rows[0].puntos : 0;
}

module.exports = {
  incrementarProgreso,
  obtenerPuntosUsuario
};
