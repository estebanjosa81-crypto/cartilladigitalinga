# Secciones — Compressed

**Qué hace:** Provee el contenido dinámico de banners y slides del carrusel de la página de inicio
**Tablas:** `secciones`
**Endpoints clave:** `GET /api/secciones` · `GET /api/secciones/banners` · `GET /api/secciones/activas`
**Archivos:** `backend/src/modules/secciones/secciones.controller.js` · `frontend/src/cartilla-inga/components/home/BannerCarrusel.tsx` · `SeccionesContenido.tsx`
**⚠️ Regla crítica:** Las secciones se filtran por `tipo` (banner, slide, contenido). El campo `activa` controla la visibilidad — no eliminar registros, desactivarlos. El admin los gestiona vía `/api/admin/secciones`.
