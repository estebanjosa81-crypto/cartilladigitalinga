# Módulos — Compressed

**Qué hace:** Módulos educativos Inga con video, secciones, imágenes, audios y actividades interactivas (Completar, Emparejar, Verdadero/Falso, Ordenar) + sistema de puntos
**Tablas:** `modulos` · `actividades` · `actividad_opciones` · `actividad_pares` · `actividad_vf` · `actividad_ordenar` · `usuario_respuestas` · `usuario_modulos` · `modulo_imagenes` · `modulo_secciones` · `modulo_audios`
**Endpoints clave:** `GET /api/modulos` · `GET /api/modulos/:clave` · `POST /api/modulos/:clave/responder` · `GET /api/modulos/:clave/progreso`
**Archivos:** `backend/src/modules/modulos/modulos.controller.js` · `frontend/src/cartilla-inga/views/VistaModulo.tsx`
**⚠️ Reglas críticas:**
- Carga de detalles de actividades usa batch `IN(?)` + `agrupar()` — nunca queries por actividad individual (N+1 eliminado).
- `responder` corre en transacción: inserta `usuario_respuestas`, actualiza `puntos`, verifica completitud del módulo, registra `usuario_modulos`.
- Validar `respuesta`: requerida, string, máx 500 chars.
- Frontend usa `safeVideoUrl()` — solo YouTube/Vimeo permitidos en iframe. `AbortController` cancela fetch al desmontar.
