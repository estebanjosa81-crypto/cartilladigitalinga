const db = require('../../config/db');
const retosService = require('../../services/retosService');

const PUNTOS_RESPUESTA_CORRECTA = parseInt(process.env.PUNTOS_RESPUESTA) || 10;

// ── Helper: carga detalles de actividades en batch (evita N+1) ───────────────

async function cargarDetallesActividades(actRows) {
  if (actRows.length === 0) return [];

  const ids = actRows.map(a => a.id);

  // Batch load de todas las tablas de detalles en paralelo
  const [
    [opciones],
    [pares],
    [vf],
    [ordenar],
  ] = await Promise.all([
    db.query(
      'SELECT actividad_id, id, texto, orden FROM actividad_opciones WHERE actividad_id IN (?) ORDER BY actividad_id, orden',
      [ids]
    ),
    db.query(
      'SELECT actividad_id, id, inga, espanol FROM actividad_pares WHERE actividad_id IN (?)',
      [ids]
    ),
    db.query(
      'SELECT actividad_id, id, enunciado, es_verdadero, orden FROM actividad_vf WHERE actividad_id IN (?) ORDER BY actividad_id, orden',
      [ids]
    ),
    db.query(
      'SELECT actividad_id, id, fragmento, orden_correcto FROM actividad_ordenar WHERE actividad_id IN (?) ORDER BY actividad_id, orden_correcto',
      [ids]
    ),
  ]);

  // Indexar por actividad_id para O(1) lookup
  const opcionesByAct  = agrupar(opciones, 'actividad_id');
  const paresByAct     = agrupar(pares,    'actividad_id');
  const vfByAct        = agrupar(vf,       'actividad_id');
  const ordenarByAct   = agrupar(ordenar,  'actividad_id');

  return actRows.map(act => {
    if (act.tipo === 'completar')     return { ...act, opciones:          opcionesByAct[act.id]  || [] };
    if (act.tipo === 'emparejar')     return { ...act, pares:             paresByAct[act.id]     || [] };
    if (act.tipo === 'verdadero_falso') return { ...act, enunciados_vf:   vfByAct[act.id]        || [] };
    if (act.tipo === 'ordenar')       return { ...act, fragmentos_ordenar: ordenarByAct[act.id]  || [] };
    return act;
  });
}

function agrupar(rows, key) {
  return rows.reduce((acc, row) => {
    const k = row[key];
    if (!acc[k]) acc[k] = [];
    acc[k].push(row);
    return acc;
  }, {});
}

// ── Listar módulos ────────────────────────────────────────────────────────────

exports.listar = async (req, res, next) => {
  try {
    const [modulos] = await db.query(
      'SELECT id, clave, titulo, icono, color, descripcion, video_url, frase, traduccion FROM modulos ORDER BY id ASC'
    );
    res.json(modulos);
  } catch (err) {
    next(err);
  }
};

// ── Obtener módulo completo ───────────────────────────────────────────────────

exports.obtener = async (req, res, next) => {
  try {
    const clave = String(req.params.clave || '').trim();

    const [modulos] = await db.query('SELECT * FROM modulos WHERE clave = ?', [clave]);
    if (modulos.length === 0) return res.status(404).json({ error: 'Módulo no encontrado' });

    const modulo = modulos[0];
    const mid = modulo.id;

    // Cargar todo el contenido en paralelo (un solo round trip por tabla)
    const [[actRows], [imagenes], [secciones], [audios]] = await Promise.all([
      db.query('SELECT * FROM actividades WHERE modulo_id = ? ORDER BY id ASC', [mid]),
      db.query('SELECT id, url, alt, caption, orden FROM modulo_imagenes WHERE modulo_id = ? ORDER BY orden ASC, id ASC', [mid]),
      db.query('SELECT id, titulo, contenido, tipo, orden FROM modulo_secciones WHERE modulo_id = ? ORDER BY orden ASC, id ASC', [mid]),
      db.query('SELECT id, titulo, url, descripcion, orden FROM modulo_audios WHERE modulo_id = ? ORDER BY orden ASC, id ASC', [mid]),
    ]);

    // Cargar detalles de actividades en batch (sin N+1)
    const actividades = await cargarDetallesActividades(actRows);

    res.json({ ...modulo, actividades, imagenes, secciones, audios });
  } catch (err) {
    next(err);
  }
};

// ── Responder actividad ───────────────────────────────────────────────────────

exports.responder = async (req, res, next) => {
  try {
    const clave    = String(req.params.clave || '').trim();
    const respuesta = req.body.respuesta;
    const usuarioId = req.usuario.id;

    if (respuesta === undefined || respuesta === null) {
      return res.status(400).json({ error: 'La respuesta es requerida' });
    }
    if (typeof respuesta !== 'string' || respuesta.length > 500) {
      return res.status(400).json({ error: 'Respuesta inválida' });
    }

    const [modulos] = await db.query('SELECT id FROM modulos WHERE clave = ?', [clave]);
    if (modulos.length === 0) return res.status(404).json({ error: 'Módulo no encontrado' });

    const moduloId = modulos[0].id;

    const [actividades] = await db.query(
      'SELECT * FROM actividades WHERE modulo_id = ? LIMIT 1', [moduloId]
    );
    if (actividades.length === 0) return res.status(404).json({ error: 'Actividad no encontrada' });

    const actividad  = actividades[0];
    const esCorrecta = actividad.tipo === 'completar' && respuesta === actividad.respuesta_correcta;
    const puntosGanados = esCorrecta ? PUNTOS_RESPUESTA_CORRECTA : 0;

    // Registrar respuesta y actualizar puntos en una transacción
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(
        'INSERT INTO usuario_respuestas (usuario_id, actividad_id, respuesta, es_correcta, puntos_obtenidos) VALUES (?, ?, ?, ?, ?)',
        [usuarioId, actividad.id, respuesta, esCorrecta, puntosGanados]
      );

      if (puntosGanados > 0) {
        await conn.query('UPDATE usuarios SET puntos = puntos + ? WHERE id = ?', [puntosGanados, usuarioId]);
        await retosService.incrementarProgreso(usuarioId, 'vocabulario', 1);

        // Verificar si completó el módulo (una sola query con subquery)
        const [[{ total, correctas }]] = await conn.query(
          `SELECT
             (SELECT COUNT(*) FROM actividades WHERE modulo_id = ?) AS total,
             (SELECT COUNT(DISTINCT ur.actividad_id)
              FROM usuario_respuestas ur
              JOIN actividades a ON ur.actividad_id = a.id
              WHERE ur.usuario_id = ? AND a.modulo_id = ? AND ur.es_correcta = TRUE) AS correctas`,
          [moduloId, usuarioId, moduloId]
        );

        if (Number(correctas) >= Number(total)) {
          await conn.query(
            `INSERT INTO usuario_modulos (usuario_id, modulo_id, completado, puntos_obtenidos, completado_en)
             VALUES (?, ?, TRUE, ?, NOW())
             ON DUPLICATE KEY UPDATE completado = TRUE, completado_en = NOW()`,
            [usuarioId, moduloId, puntosGanados]
          );
          await retosService.incrementarProgreso(usuarioId, 'modulo', 1);
        }
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    const [[usuario]] = await db.query('SELECT puntos FROM usuarios WHERE id = ?', [usuarioId]);

    res.json({
      correcta:        esCorrecta,
      puntos_obtenidos: puntosGanados,
      puntos_totales:   usuario.puntos,
    });
  } catch (err) {
    next(err);
  }
};

// ── Progreso del usuario en un módulo ─────────────────────────────────────────

exports.progreso = async (req, res, next) => {
  try {
    const clave     = String(req.params.clave || '').trim();
    const usuarioId = req.usuario.id;

    const [modulos] = await db.query('SELECT id FROM modulos WHERE clave = ?', [clave]);
    if (modulos.length === 0) return res.status(404).json({ error: 'Módulo no encontrado' });

    const [progreso] = await db.query(
      'SELECT completado, puntos_obtenidos, completado_en FROM usuario_modulos WHERE usuario_id = ? AND modulo_id = ?',
      [usuarioId, modulos[0].id]
    );

    res.json(progreso.length > 0 ? progreso[0] : { completado: false, puntos_obtenidos: 0 });
  } catch (err) {
    next(err);
  }
};
