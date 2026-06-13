const db = require('../../config/db');

// =====================================================
// DASHBOARD STATS
// =====================================================
exports.getStats = async (req, res, next) => {
  try {
    const [[{ total_usuarios }]] = await db.query('SELECT COUNT(*) total_usuarios FROM usuarios WHERE role = "user"');
    const [[{ usuarios_activos_hoy }]] = await db.query(
      'SELECT COUNT(*) usuarios_activos_hoy FROM usuarios WHERE ultimo_acceso = CURDATE() AND role = "user"'
    );
    const [[{ modulos_completados }]] = await db.query(
      'SELECT COUNT(*) modulos_completados FROM usuario_modulos WHERE completado = TRUE'
    );
    const [[{ total_publicaciones }]] = await db.query('SELECT COUNT(*) total_publicaciones FROM publicaciones');
    const [[{ puntos_totales }]] = await db.query('SELECT COALESCE(SUM(puntos),0) puntos_totales FROM usuarios WHERE role = "user"');
    const [[{ total_modulos }]] = await db.query('SELECT COUNT(*) total_modulos FROM modulos');

    res.json({
      total_usuarios,
      usuarios_activos_hoy,
      modulos_completados,
      total_publicaciones,
      puntos_totales,
      total_modulos,
    });
  } catch (err) {
    next(err);
  }
};

// =====================================================
// USUARIOS
// =====================================================
exports.listarUsuarios = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT
        u.id, u.nombre, u.email, u.avatar, u.nivel, u.role,
        u.puntos, u.dias_seguidos, u.palabras_aprendidas,
        u.ultimo_acceso, u.creado_en,
        COUNT(um.id) modulos_completados
      FROM usuarios u
      LEFT JOIN usuario_modulos um ON um.usuario_id = u.id AND um.completado = TRUE
      GROUP BY u.id
      ORDER BY u.creado_en DESC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.actualizarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, puntos, nivel, role } = req.body;

    // No puede degradar al propio admin que hace la petición
    if (String(id) === String(req.usuario.id) && role === 'user') {
      return res.status(400).json({ error: 'No puedes quitarte el rol de administrador a ti mismo.' });
    }

    const campos = [];
    const valores = [];

    if (nombre  !== undefined) { campos.push('nombre = ?');  valores.push(nombre); }
    if (puntos  !== undefined) { campos.push('puntos = ?');  valores.push(Number(puntos)); }
    if (nivel   !== undefined) { campos.push('nivel = ?');   valores.push(nivel); }
    if (role    !== undefined) { campos.push('role = ?');    valores.push(role); }

    if (campos.length === 0) return res.status(400).json({ error: 'No hay campos para actualizar.' });

    valores.push(id);
    await db.query(`UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`, valores);

    const [[usuario]] = await db.query(
      'SELECT id, nombre, email, avatar, nivel, role, puntos, dias_seguidos, palabras_aprendidas, ultimo_acceso, creado_en FROM usuarios WHERE id = ?',
      [id]
    );
    res.json(usuario);
  } catch (err) {
    next(err);
  }
};

exports.eliminarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (String(id) === String(req.usuario.id)) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta de administrador.' });
    }

    const [[usuario]] = await db.query('SELECT role FROM usuarios WHERE id = ?', [id]);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
    if (usuario.role === 'admin') {
      return res.status(400).json({ error: 'No puedes eliminar otro administrador.' });
    }

    await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
    res.json({ mensaje: 'Usuario eliminado correctamente.' });
  } catch (err) {
    next(err);
  }
};

// =====================================================
// MÓDULOS
// =====================================================
exports.listarModulos = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT
        m.id, m.clave, m.titulo, m.icono, m.color,
        m.descripcion, m.video_url, m.frase, m.traduccion,
        COUNT(DISTINCT um.id) completados,
        COUNT(DISTINCT a.id) > 0 tiene_actividad
      FROM modulos m
      LEFT JOIN usuario_modulos um ON um.modulo_id = m.id AND um.completado = TRUE
      LEFT JOIN actividades a ON a.modulo_id = m.id
      GROUP BY m.id
      ORDER BY m.id ASC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.crearModulo = async (req, res, next) => {
  try {
    const { clave, titulo, icono, color, descripcion, video_url, frase, traduccion } = req.body;

    if (!clave || !titulo || !icono || !color || !descripcion || !frase || !traduccion) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    const [result] = await db.query(
      'INSERT INTO modulos (clave, titulo, icono, color, descripcion, video_url, frase, traduccion) VALUES (?,?,?,?,?,?,?,?)',
      [clave, titulo, icono, color, descripcion, video_url || '', frase, traduccion]
    );

    const [[modulo]] = await db.query('SELECT * FROM modulos WHERE id = ?', [result.insertId]);
    res.status(201).json({ ...modulo, completados: 0, tiene_actividad: false });
  } catch (err) {
    next(err);
  }
};

exports.actualizarModulo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, icono, color, descripcion, video_url, frase, traduccion } = req.body;

    await db.query(
      'UPDATE modulos SET titulo=?, icono=?, color=?, descripcion=?, video_url=?, frase=?, traduccion=? WHERE id=?',
      [titulo, icono, color, descripcion, video_url || '', frase, traduccion, id]
    );

    const [[modulo]] = await db.query('SELECT * FROM modulos WHERE id = ?', [id]);
    res.json(modulo);
  } catch (err) {
    next(err);
  }
};

exports.eliminarModulo = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM modulos WHERE id = ?', [id]);
    res.json({ mensaje: 'Módulo eliminado correctamente.' });
  } catch (err) {
    next(err);
  }
};

// =====================================================
// ACTIVIDAD DEL MÓDULO
// =====================================================
exports.getActividad = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [actividades] = await db.query('SELECT * FROM actividades WHERE modulo_id = ?', [id]);
    if (actividades.length === 0) return res.json(null);

    const act = actividades[0];

    if (act.tipo === 'completar') {
      const [opciones] = await db.query(
        'SELECT id, texto, orden FROM actividad_opciones WHERE actividad_id = ? ORDER BY orden',
        [act.id]
      );
      return res.json({ ...act, opciones });
    }

    const [pares] = await db.query(
      'SELECT id, inga, espanol FROM actividad_pares WHERE actividad_id = ?',
      [act.id]
    );
    res.json({ ...act, pares });
  } catch (err) {
    next(err);
  }
};

exports.actualizarActividad = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { id } = req.params;
    const { tipo, pregunta, respuesta_correcta, opciones, pares } = req.body;
    await conn.query('DELETE FROM actividades WHERE modulo_id = ?', [id]);
    const [result] = await conn.query(
      'INSERT INTO actividades (modulo_id, tipo, pregunta, respuesta_correcta) VALUES (?,?,?,?)',
      [id, tipo, pregunta, tipo === 'completar' ? respuesta_correcta : null]
    );
    const actividadId = result.insertId;
    if (tipo === 'completar' && Array.isArray(opciones)) {
      for (let i = 0; i < opciones.length; i++) {
        await conn.query('INSERT INTO actividad_opciones (actividad_id, texto, orden) VALUES (?,?,?)', [actividadId, opciones[i], i + 1]);
      }
    } else if (tipo === 'emparejar' && Array.isArray(pares)) {
      for (const par of pares) {
        await conn.query('INSERT INTO actividad_pares (actividad_id, inga, espanol) VALUES (?,?,?)', [actividadId, par.inga, par.espanol]);
      }
    }
    await conn.commit();
    res.json({ mensaje: 'Actividad actualizada correctamente.' });
  } catch (err) { await conn.rollback(); next(err); } finally { conn.release(); }
};

// =====================================================
// ACTIVIDADES V2 — Múltiples por módulo, tipos extendidos
// =====================================================
const cargarActividadCompleta = async (act) => {
  if (act.tipo === 'completar') {
    const [ops] = await db.query('SELECT id, texto, orden FROM actividad_opciones WHERE actividad_id = ? ORDER BY orden', [act.id]);
    return { ...act, opciones: ops };
  }
  if (act.tipo === 'emparejar') {
    const [pares] = await db.query('SELECT id, inga, espanol FROM actividad_pares WHERE actividad_id = ?', [act.id]);
    return { ...act, pares };
  }
  if (act.tipo === 'verdadero_falso') {
    const [enunciados] = await db.query('SELECT id, enunciado, es_verdadero, orden FROM actividad_vf WHERE actividad_id = ? ORDER BY orden', [act.id]);
    return { ...act, enunciados_vf: enunciados };
  }
  if (act.tipo === 'ordenar') {
    const [frags] = await db.query('SELECT id, fragmento, orden_correcto FROM actividad_ordenar WHERE actividad_id = ? ORDER BY orden_correcto', [act.id]);
    return { ...act, fragmentos_ordenar: frags };
  }
  return act;
};

exports.listarActividadesModulo = async (req, res, next) => {
  try {
    const [acts] = await db.query('SELECT * FROM actividades WHERE modulo_id = ? ORDER BY id ASC', [req.params.id]);
    const completas = await Promise.all(acts.map(cargarActividadCompleta));
    res.json(completas);
  } catch (err) { next(err); }
};

exports.crearActividad = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { id } = req.params;
    const { tipo, pregunta, respuesta_correcta, opciones, pares, enunciados_vf, fragmentos_ordenar } = req.body;
    if (!tipo || !pregunta) return res.status(400).json({ error: 'Tipo y pregunta son obligatorios.' });
    const [r] = await conn.query(
      'INSERT INTO actividades (modulo_id, tipo, pregunta, respuesta_correcta) VALUES (?,?,?,?)',
      [id, tipo, pregunta, tipo === 'completar' ? (respuesta_correcta || null) : null]
    );
    const actId = r.insertId;
    await _insertarDetallesActividad(conn, actId, tipo, { opciones, pares, enunciados_vf, fragmentos_ordenar });
    await conn.commit();
    const [[act]] = await db.query('SELECT * FROM actividades WHERE id = ?', [actId]);
    res.status(201).json(await cargarActividadCompleta(act));
  } catch (err) { await conn.rollback(); next(err); } finally { conn.release(); }
};

exports.actualizarActividadV2 = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { actId } = req.params;
    const { tipo, pregunta, respuesta_correcta, opciones, pares, enunciados_vf, fragmentos_ordenar } = req.body;
    await conn.query(
      'UPDATE actividades SET tipo=?, pregunta=?, respuesta_correcta=? WHERE id=?',
      [tipo, pregunta, tipo === 'completar' ? (respuesta_correcta || null) : null, actId]
    );
    await conn.query('DELETE FROM actividad_opciones WHERE actividad_id = ?', [actId]);
    await conn.query('DELETE FROM actividad_pares WHERE actividad_id = ?', [actId]);
    await conn.query('DELETE FROM actividad_vf WHERE actividad_id = ?', [actId]);
    await conn.query('DELETE FROM actividad_ordenar WHERE actividad_id = ?', [actId]);
    await _insertarDetallesActividad(conn, actId, tipo, { opciones, pares, enunciados_vf, fragmentos_ordenar });
    await conn.commit();
    const [[act]] = await db.query('SELECT * FROM actividades WHERE id = ?', [actId]);
    res.json(await cargarActividadCompleta(act));
  } catch (err) { await conn.rollback(); next(err); } finally { conn.release(); }
};

exports.eliminarActividad = async (req, res, next) => {
  try {
    await db.query('DELETE FROM actividades WHERE id = ? AND modulo_id = ?', [req.params.actId, req.params.id]);
    res.json({ mensaje: 'Actividad eliminada.' });
  } catch (err) { next(err); }
};

async function _insertarDetallesActividad(conn, actId, tipo, { opciones, pares, enunciados_vf, fragmentos_ordenar }) {
  if (tipo === 'completar' && Array.isArray(opciones)) {
    for (let i = 0; i < opciones.length; i++)
      await conn.query('INSERT INTO actividad_opciones (actividad_id, texto, orden) VALUES (?,?,?)', [actId, typeof opciones[i] === 'string' ? opciones[i] : opciones[i].texto, i + 1]);
  } else if (tipo === 'emparejar' && Array.isArray(pares)) {
    for (const p of pares)
      await conn.query('INSERT INTO actividad_pares (actividad_id, inga, espanol) VALUES (?,?,?)', [actId, p.inga, p.espanol]);
  } else if (tipo === 'verdadero_falso' && Array.isArray(enunciados_vf)) {
    for (let i = 0; i < enunciados_vf.length; i++)
      await conn.query('INSERT INTO actividad_vf (actividad_id, enunciado, es_verdadero, orden) VALUES (?,?,?,?)', [actId, enunciados_vf[i].enunciado, enunciados_vf[i].es_verdadero ? 1 : 0, i]);
  } else if (tipo === 'ordenar' && Array.isArray(fragmentos_ordenar)) {
    for (let i = 0; i < fragmentos_ordenar.length; i++)
      await conn.query('INSERT INTO actividad_ordenar (actividad_id, fragmento, orden_correcto) VALUES (?,?,?)', [actId, fragmentos_ordenar[i].fragmento, i]);
  }
}

// =====================================================
// CONTENIDO DEL MÓDULO — Imágenes, Secciones, Audios
// =====================================================

// Imágenes
exports.listarImagenesModulo = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM modulo_imagenes WHERE modulo_id = ? ORDER BY orden ASC, id ASC', [req.params.id]);
    res.json(rows);
  } catch (err) { next(err); }
};
exports.crearImagenModulo = async (req, res, next) => {
  try {
    const { url, alt, caption, orden } = req.body;
    if (!url) return res.status(400).json({ error: 'URL es obligatoria.' });
    const [r] = await db.query('INSERT INTO modulo_imagenes (modulo_id, url, alt, caption, orden) VALUES (?,?,?,?,?)',
      [req.params.id, url, alt || null, caption || null, orden ?? 0]);
    const [[row]] = await db.query('SELECT * FROM modulo_imagenes WHERE id = ?', [r.insertId]);
    res.status(201).json(row);
  } catch (err) { next(err); }
};
exports.actualizarImagenModulo = async (req, res, next) => {
  try {
    const { url, alt, caption, orden } = req.body;
    await db.query('UPDATE modulo_imagenes SET url=?, alt=?, caption=?, orden=? WHERE id=? AND modulo_id=?',
      [url, alt || null, caption || null, orden ?? 0, req.params.imgId, req.params.id]);
    const [[row]] = await db.query('SELECT * FROM modulo_imagenes WHERE id = ?', [req.params.imgId]);
    res.json(row);
  } catch (err) { next(err); }
};
exports.eliminarImagenModulo = async (req, res, next) => {
  try {
    await db.query('DELETE FROM modulo_imagenes WHERE id = ? AND modulo_id = ?', [req.params.imgId, req.params.id]);
    res.json({ mensaje: 'Imagen eliminada.' });
  } catch (err) { next(err); }
};

// Secciones de contenido
exports.listarSeccionesModulo = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM modulo_secciones WHERE modulo_id = ? ORDER BY orden ASC, id ASC', [req.params.id]);
    res.json(rows);
  } catch (err) { next(err); }
};
exports.crearSeccionModulo = async (req, res, next) => {
  try {
    const { titulo, contenido, tipo, orden } = req.body;
    if (!titulo) return res.status(400).json({ error: 'Título es obligatorio.' });
    const [r] = await db.query('INSERT INTO modulo_secciones (modulo_id, titulo, contenido, tipo, orden) VALUES (?,?,?,?,?)',
      [req.params.id, titulo, contenido || null, tipo || 'texto', orden ?? 0]);
    const [[row]] = await db.query('SELECT * FROM modulo_secciones WHERE id = ?', [r.insertId]);
    res.status(201).json(row);
  } catch (err) { next(err); }
};
exports.actualizarSeccionModulo = async (req, res, next) => {
  try {
    const { titulo, contenido, tipo, orden } = req.body;
    await db.query('UPDATE modulo_secciones SET titulo=?, contenido=?, tipo=?, orden=? WHERE id=? AND modulo_id=?',
      [titulo, contenido || null, tipo || 'texto', orden ?? 0, req.params.secId, req.params.id]);
    const [[row]] = await db.query('SELECT * FROM modulo_secciones WHERE id = ?', [req.params.secId]);
    res.json(row);
  } catch (err) { next(err); }
};
exports.eliminarSeccionModulo = async (req, res, next) => {
  try {
    await db.query('DELETE FROM modulo_secciones WHERE id = ? AND modulo_id = ?', [req.params.secId, req.params.id]);
    res.json({ mensaje: 'Sección eliminada.' });
  } catch (err) { next(err); }
};

// Audios
exports.listarAudiosModulo = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM modulo_audios WHERE modulo_id = ? ORDER BY orden ASC, id ASC', [req.params.id]);
    res.json(rows);
  } catch (err) { next(err); }
};
exports.crearAudioModulo = async (req, res, next) => {
  try {
    const { titulo, url, descripcion, orden } = req.body;
    if (!titulo || !url) return res.status(400).json({ error: 'Título y URL son obligatorios.' });
    const [r] = await db.query('INSERT INTO modulo_audios (modulo_id, titulo, url, descripcion, orden) VALUES (?,?,?,?,?)',
      [req.params.id, titulo, url, descripcion || null, orden ?? 0]);
    const [[row]] = await db.query('SELECT * FROM modulo_audios WHERE id = ?', [r.insertId]);
    res.status(201).json(row);
  } catch (err) { next(err); }
};
exports.actualizarAudioModulo = async (req, res, next) => {
  try {
    const { titulo, url, descripcion, orden } = req.body;
    await db.query('UPDATE modulo_audios SET titulo=?, url=?, descripcion=?, orden=? WHERE id=? AND modulo_id=?',
      [titulo, url, descripcion || null, orden ?? 0, req.params.audId, req.params.id]);
    const [[row]] = await db.query('SELECT * FROM modulo_audios WHERE id = ?', [req.params.audId]);
    res.json(row);
  } catch (err) { next(err); }
};
exports.eliminarAudioModulo = async (req, res, next) => {
  try {
    await db.query('DELETE FROM modulo_audios WHERE id = ? AND modulo_id = ?', [req.params.audId, req.params.id]);
    res.json({ mensaje: 'Audio eliminado.' });
  } catch (err) { next(err); }
};

// =====================================================
// COMUNIDAD
// =====================================================
exports.listarPublicaciones = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT
        p.id, p.contenido, p.likes, p.creado_en,
        u.nombre usuario, u.avatar, u.email,
        (SELECT COUNT(*) FROM comentarios c WHERE c.publicacion_id = p.id) comentarios
      FROM publicaciones p
      JOIN usuarios u ON u.id = p.usuario_id
      ORDER BY p.creado_en DESC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.eliminarPublicacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM publicaciones WHERE id = ?', [id]);
    res.json({ mensaje: 'Publicación eliminada correctamente.' });
  } catch (err) {
    next(err);
  }
};

// =====================================================
// BANCO DE CONOCIMIENTO — VOCABULARIO
// =====================================================
exports.listarVocabulario = async (req, res, next) => {
  try {
    const { modulo_id, categoria } = req.query;
    const where = [];
    const vals = [];
    if (modulo_id) { where.push('modulo_id = ?'); vals.push(modulo_id); }
    if (categoria) { where.push('categoria = ?'); vals.push(categoria); }
    const sql = `SELECT * FROM banco_vocabulario${where.length ? ' WHERE ' + where.join(' AND ') : ''} ORDER BY modulo_id ASC, espanol ASC`;
    const [rows] = await db.query(sql, vals);
    res.json(rows);
  } catch (err) { next(err); }
};

exports.crearVocabulario = async (req, res, next) => {
  try {
    const { espanol, inga, categoria = 'general', modulo_id = null, notas = null } = req.body;
    if (!espanol || !inga) return res.status(400).json({ error: 'espanol e inga son obligatorios.' });
    const [r] = await db.query(
      'INSERT INTO banco_vocabulario (espanol, inga, categoria, modulo_id, notas) VALUES (?,?,?,?,?)',
      [espanol, inga, categoria, modulo_id || null, notas || null]
    );
    const [[row]] = await db.query('SELECT * FROM banco_vocabulario WHERE id = ?', [r.insertId]);
    res.status(201).json(row);
  } catch (err) { next(err); }
};

exports.actualizarVocabulario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { espanol, inga, categoria, modulo_id, notas } = req.body;
    await db.query(
      'UPDATE banco_vocabulario SET espanol=?, inga=?, categoria=?, modulo_id=?, notas=? WHERE id=?',
      [espanol, inga, categoria || 'general', modulo_id || null, notas || null, id]
    );
    const [[row]] = await db.query('SELECT * FROM banco_vocabulario WHERE id = ?', [id]);
    res.json(row);
  } catch (err) { next(err); }
};

exports.eliminarVocabulario = async (req, res, next) => {
  try {
    await db.query('DELETE FROM banco_vocabulario WHERE id = ?', [req.params.id]);
    res.json({ mensaje: 'Entrada eliminada.' });
  } catch (err) { next(err); }
};

exports.importarVocabulario = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { pares, modulo_id = null, categoria = 'general' } = req.body;
    if (!Array.isArray(pares) || pares.length === 0) {
      return res.status(400).json({ error: 'No hay pares para importar.' });
    }
    let insertados = 0;
    for (const par of pares) {
      if (par.espanol && par.inga) {
        await conn.query(
          'INSERT INTO banco_vocabulario (espanol, inga, categoria, modulo_id) VALUES (?,?,?,?)',
          [par.espanol.trim(), par.inga.trim(), categoria, modulo_id || null]
        );
        insertados++;
      }
    }
    await conn.commit();
    res.json({ insertados });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

// =====================================================
// BANCO DE CONOCIMIENTO — TEXTOS CULTURALES
// =====================================================
exports.listarTextos = async (req, res, next) => {
  try {
    const { tipo, modulo_id } = req.query;
    const where = [];
    const vals = [];
    if (tipo) { where.push('tipo = ?'); vals.push(tipo); }
    if (modulo_id) { where.push('modulo_id = ?'); vals.push(modulo_id); }
    const sql = `SELECT * FROM banco_textos${where.length ? ' WHERE ' + where.join(' AND ') : ''} ORDER BY tipo ASC, titulo ASC`;
    const [rows] = await db.query(sql, vals);
    res.json(rows);
  } catch (err) { next(err); }
};

exports.crearTexto = async (req, res, next) => {
  try {
    const { titulo, tipo, contenido, modulo_id = null } = req.body;
    if (!titulo || !tipo || !contenido) return res.status(400).json({ error: 'titulo, tipo y contenido son obligatorios.' });
    const [r] = await db.query(
      'INSERT INTO banco_textos (titulo, tipo, contenido, modulo_id) VALUES (?,?,?,?)',
      [titulo, tipo, contenido, modulo_id || null]
    );
    const [[row]] = await db.query('SELECT * FROM banco_textos WHERE id = ?', [r.insertId]);
    res.status(201).json(row);
  } catch (err) { next(err); }
};

exports.actualizarTexto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, tipo, contenido, modulo_id } = req.body;
    await db.query(
      'UPDATE banco_textos SET titulo=?, tipo=?, contenido=?, modulo_id=? WHERE id=?',
      [titulo, tipo, contenido, modulo_id || null, id]
    );
    const [[row]] = await db.query('SELECT * FROM banco_textos WHERE id = ?', [id]);
    res.json(row);
  } catch (err) { next(err); }
};

exports.eliminarTexto = async (req, res, next) => {
  try {
    await db.query('DELETE FROM banco_textos WHERE id = ?', [req.params.id]);
    res.json({ mensaje: 'Texto eliminado.' });
  } catch (err) { next(err); }
};

// =====================================================
// CONFIGURACIÓN GENERAL
// =====================================================
exports.getConfiguracion = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT clave, valor FROM configuracion');
    const cfg = {};
    rows.forEach(r => { cfg[r.clave] = r.valor ?? ''; });
    res.json(cfg);
  } catch (err) { next(err); }
};

exports.actualizarConfiguracion = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    for (const [clave, valor] of Object.entries(req.body)) {
      await conn.query(
        'INSERT INTO configuracion (clave, valor) VALUES (?,?) ON DUPLICATE KEY UPDATE valor=?',
        [clave, valor, valor]
      );
    }
    await conn.commit();
    const [rows] = await db.query('SELECT clave, valor FROM configuracion');
    const cfg = {};
    rows.forEach(r => { cfg[r.clave] = r.valor ?? ''; });
    res.json(cfg);
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

// =====================================================
// UPLOAD DE IMÁGENES (Cloudinary)
// =====================================================
exports.uploadImagen = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo.' });

    const [rows] = await db.query(
      'SELECT clave, valor FROM configuracion WHERE clave IN (?,?,?)',
      ['cloudinary_cloud_name', 'cloudinary_api_key', 'cloudinary_api_secret']
    );
    const cfg = {};
    rows.forEach(r => { cfg[r.clave] = r.valor; });

    if (!cfg.cloudinary_cloud_name || !cfg.cloudinary_api_key || !cfg.cloudinary_api_secret) {
      return res.status(400).json({ error: 'Configura las credenciales de Cloudinary en la sección Configuración.' });
    }

    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: cfg.cloudinary_cloud_name,
      api_key:    cfg.cloudinary_api_key,
      api_secret: cfg.cloudinary_api_secret,
    });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'cartilla-inga', resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (err) { next(err); }
};

// =====================================================
// UPLOAD DE AUDIO (Cloudinary)
// =====================================================
exports.uploadAudio = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo.' });

    const [rows] = await db.query(
      'SELECT clave, valor FROM configuracion WHERE clave IN (?,?,?)',
      ['cloudinary_cloud_name', 'cloudinary_api_key', 'cloudinary_api_secret']
    );
    const cfg = {};
    rows.forEach(r => { cfg[r.clave] = r.valor; });

    if (!cfg.cloudinary_cloud_name || !cfg.cloudinary_api_key || !cfg.cloudinary_api_secret) {
      return res.status(400).json({ error: 'Configura las credenciales de Cloudinary en la sección Configuración.' });
    }

    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: cfg.cloudinary_cloud_name,
      api_key:    cfg.cloudinary_api_key,
      api_secret: cfg.cloudinary_api_secret,
    });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'cartilla-inga/audios', resource_type: 'auto' },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (err) { next(err); }
};

// =====================================================
// SECCIONES DE LA CARTILLA (presentación digital)
// =====================================================
exports.listarSecciones = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM cartilla_secciones ORDER BY orden ASC, id ASC');
    res.json(rows);
  } catch (err) { next(err); }
};

exports.crearSeccion = async (req, res, next) => {
  try {
    const { titulo, subtitulo, contenido, imagen_url, imagen_alt, link_url, orden, tipo, activo } = req.body;
    if (!titulo) return res.status(400).json({ error: 'El título es obligatorio.' });
    const [r] = await db.query(
      'INSERT INTO cartilla_secciones (titulo, subtitulo, contenido, imagen_url, imagen_alt, link_url, orden, tipo, activo) VALUES (?,?,?,?,?,?,?,?,?)',
      [titulo, subtitulo || null, contenido || null, imagen_url || null, imagen_alt || null,
       link_url || null, orden ?? 0, tipo || 'presentacion', activo !== false ? 1 : 0]
    );
    const [[row]] = await db.query('SELECT * FROM cartilla_secciones WHERE id = ?', [r.insertId]);
    res.status(201).json(row);
  } catch (err) { next(err); }
};

exports.actualizarSeccion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const campos = [];
    const valores = [];

    if (body.titulo     !== undefined) { campos.push('titulo=?');     valores.push(body.titulo); }
    if (body.subtitulo  !== undefined) { campos.push('subtitulo=?');  valores.push(body.subtitulo  || null); }
    if (body.contenido  !== undefined) { campos.push('contenido=?');  valores.push(body.contenido  || null); }
    if (body.imagen_url !== undefined) { campos.push('imagen_url=?'); valores.push(body.imagen_url || null); }
    if (body.imagen_alt !== undefined) { campos.push('imagen_alt=?'); valores.push(body.imagen_alt || null); }
    if (body.link_url   !== undefined) { campos.push('link_url=?');   valores.push(body.link_url   || null); }
    if (body.orden      !== undefined) { campos.push('orden=?');      valores.push(body.orden ?? 0); }
    if (body.tipo       !== undefined) { campos.push('tipo=?');       valores.push(body.tipo); }
    if (body.activo     !== undefined) { campos.push('activo=?');     valores.push(body.activo !== false ? 1 : 0); }

    if (campos.length === 0) return res.status(400).json({ error: 'Sin campos para actualizar.' });

    valores.push(id);
    await db.query(`UPDATE cartilla_secciones SET ${campos.join(', ')} WHERE id=?`, valores);
    const [[row]] = await db.query('SELECT * FROM cartilla_secciones WHERE id = ?', [id]);
    res.json(row);
  } catch (err) { next(err); }
};

exports.eliminarSeccion = async (req, res, next) => {
  try {
    await db.query('DELETE FROM cartilla_secciones WHERE id = ?', [req.params.id]);
    res.json({ mensaje: 'Sección eliminada.' });
  } catch (err) { next(err); }
};

exports.reordenarSecciones = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    for (const { id, orden } of req.body) {
      await conn.query('UPDATE cartilla_secciones SET orden=? WHERE id=?', [orden, id]);
    }
    await conn.commit();
    res.json({ mensaje: 'Orden actualizado.' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};
