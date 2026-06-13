const db = require('../../config/db');
const retosService = require('../../services/retosService');

exports.listar = async (req, res, next) => {
  try {
    const [modulos] = await db.query(
      'SELECT id, clave, titulo, icono, color, descripcion, video_url, frase, traduccion FROM modulos'
    );
    res.json(modulos);
  } catch (err) {
    next(err);
  }
};

exports.obtener = async (req, res, next) => {
  try {
    const { clave } = req.params;

    const [modulos] = await db.query('SELECT * FROM modulos WHERE clave = ?', [clave]);
    if (modulos.length === 0) return res.status(404).json({ error: 'Módulo no encontrado' });

    const modulo = modulos[0];
    const mid = modulo.id;

    // Cargar todo el contenido en paralelo
    const [
      [actRows],
      [imagenes],
      [secciones],
      [audios],
    ] = await Promise.all([
      db.query('SELECT * FROM actividades WHERE modulo_id = ? ORDER BY id ASC', [mid]),
      db.query('SELECT id, url, alt, caption, orden FROM modulo_imagenes WHERE modulo_id = ? ORDER BY orden ASC, id ASC', [mid]),
      db.query('SELECT id, titulo, contenido, tipo, orden FROM modulo_secciones WHERE modulo_id = ? ORDER BY orden ASC, id ASC', [mid]),
      db.query('SELECT id, titulo, url, descripcion, orden FROM modulo_audios WHERE modulo_id = ? ORDER BY orden ASC, id ASC', [mid]),
    ]);

    // Cargar detalles de cada actividad
    const actividades = await Promise.all(actRows.map(async (act) => {
      if (act.tipo === 'completar') {
        const [ops] = await db.query(
          'SELECT id, texto, orden FROM actividad_opciones WHERE actividad_id = ? ORDER BY orden', [act.id]
        );
        return { ...act, opciones: ops };
      }
      if (act.tipo === 'emparejar') {
        const [pares] = await db.query(
          'SELECT id, inga, espanol FROM actividad_pares WHERE actividad_id = ?', [act.id]
        );
        return { ...act, pares };
      }
      if (act.tipo === 'verdadero_falso') {
        const [enunciados] = await db.query(
          'SELECT id, enunciado, es_verdadero, orden FROM actividad_vf WHERE actividad_id = ? ORDER BY orden', [act.id]
        );
        return { ...act, enunciados_vf: enunciados };
      }
      if (act.tipo === 'ordenar') {
        const [frags] = await db.query(
          'SELECT id, fragmento, orden_correcto FROM actividad_ordenar WHERE actividad_id = ? ORDER BY orden_correcto', [act.id]
        );
        return { ...act, fragmentos_ordenar: frags };
      }
      return act;
    }));

    res.json({ ...modulo, actividades, imagenes, secciones, audios });
  } catch (err) {
    next(err);
  }
};

exports.responder = async (req, res, next) => {
  try {
    const { clave } = req.params;
    const { respuesta } = req.body;
    const usuarioId = req.usuario.id;

    const [modulos] = await db.query('SELECT id FROM modulos WHERE clave = ?', [clave]);
    if (modulos.length === 0) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    const moduloId = modulos[0].id;

    const [actividades] = await db.query(
      'SELECT * FROM actividades WHERE modulo_id = ?', [moduloId]
    );

    if (actividades.length === 0) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    const actividad = actividades[0];
    const esCorrecta = actividad.tipo === 'completar' && respuesta === actividad.respuesta_correcta;
    const puntosGanados = esCorrecta ? 10 : 0;

    await db.query(
      'INSERT INTO usuario_respuestas (usuario_id, actividad_id, respuesta, es_correcta, puntos_obtenidos) VALUES (?, ?, ?, ?, ?)',
      [usuarioId, actividad.id, respuesta, esCorrecta, puntosGanados]
    );

    if (puntosGanados > 0) {
      await db.query('UPDATE usuarios SET puntos = puntos + ? WHERE id = ?', [puntosGanados, usuarioId]);

      // Incrementar progreso del reto de vocabulario (por respuesta correcta)
      await retosService.incrementarProgreso(usuarioId, 'vocabulario', 1);

      // Verificar si completó el módulo (todas las actividades correctas)
      const [actividadesModulo] = await db.query(
        'SELECT COUNT(*) as total FROM actividades WHERE modulo_id = ?', [moduloId]
      );
      const [respuestasCorrectas] = await db.query(
        `SELECT COUNT(DISTINCT ur.actividad_id) as correctas
         FROM usuario_respuestas ur
         JOIN actividades a ON ur.actividad_id = a.id
         WHERE ur.usuario_id = ? AND a.modulo_id = ? AND ur.es_correcta = TRUE`,
        [usuarioId, moduloId]
      );

      if (respuestasCorrectas[0].correctas >= actividadesModulo[0].total) {
        // Marcar módulo como completado
        await db.query(
          `INSERT INTO usuario_modulos (usuario_id, modulo_id, completado, puntos_obtenidos, completado_en)
           VALUES (?, ?, TRUE, ?, NOW())
           ON DUPLICATE KEY UPDATE completado = TRUE, completado_en = NOW()`,
          [usuarioId, moduloId, puntosGanados]
        );

        // Incrementar progreso del reto de módulo
        await retosService.incrementarProgreso(usuarioId, 'modulo', 1);
      }
    }

    const [usuario] = await db.query('SELECT puntos FROM usuarios WHERE id = ?', [usuarioId]);

    res.json({
      correcta: esCorrecta,
      puntos_obtenidos: puntosGanados,
      puntos_totales: usuario[0].puntos
    });
  } catch (err) {
    next(err);
  }
};

exports.progreso = async (req, res, next) => {
  try {
    const { clave } = req.params;
    const usuarioId = req.usuario.id;

    const [modulos] = await db.query('SELECT id FROM modulos WHERE clave = ?', [clave]);
    if (modulos.length === 0) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    const [progreso] = await db.query(
      'SELECT completado, puntos_obtenidos, completado_en FROM usuario_modulos WHERE usuario_id = ? AND modulo_id = ?',
      [usuarioId, modulos[0].id]
    );

    res.json(progreso.length > 0 ? progreso[0] : { completado: false, puntos_obtenidos: 0 });
  } catch (err) {
    next(err);
  }
};
