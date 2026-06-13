# Comunidad — Compressed

**Qué hace:** Feed de publicaciones de la comunidad con likes y comentarios anidados
**Tablas:** `publicaciones` · `likes` · `comentarios`
**Endpoints clave:** `GET /api/comunidad/publicaciones` · `POST /api/comunidad/publicaciones` · `POST /api/comunidad/publicaciones/:id/like` · `GET /api/comunidad/publicaciones/:id/comentarios` · `POST /api/comunidad/publicaciones/:id/comentarios`
**Archivos:** `backend/src/modules/comunidad/comunidad.controller.js` · `frontend/src/cartilla-inga/views/VistaComunidad.tsx` · `components/community/PostCard.tsx` · `PostForm.tsx`
**⚠️ Regla crítica:** El toggle de like debe ser idempotente (si ya existe, lo elimina; si no, lo crea). Requiere autenticación obligatoria en POST — usar middleware `auth`, no `authOpcional`.
