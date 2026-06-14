# Comunidad — Compressed

**Qué hace:** Feed paginado de publicaciones con likes y comentarios
**Tablas:** `publicaciones` · `publicacion_likes` · `comentarios` · `usuarios`
**Endpoints clave:** `GET /api/comunidad/publicaciones?page=1` · `POST /api/comunidad/publicaciones` · `POST /api/comunidad/publicaciones/:id/like` · `GET|POST /api/comunidad/publicaciones/:id/comentarios`
**Archivos:** `backend/src/modules/comunidad/comunidad.controller.js` · `frontend/src/cartilla-inga/views/VistaComunidad.tsx`
**⚠️ Reglas críticas:**
- `listarPublicaciones` retorna `{ data, page, pageSize, total, hasMore }` — el frontend extrae `.data`, no el array directamente.
- Conteo de comentarios por LEFT JOIN aggregate, no subquery correlacionada (N+1 eliminado).
- `crearPublicacion`, `toggleLike` y `crearComentario` corren en transacción (`beginTransaction/commit/rollback`).
- `stripHtml()` en todo contenido entrante — previene XSS almacenado. `validarId()` en params.
- Toggle like es idempotente: si existe lo elimina; si no, lo crea.
