# Módulos — Compressed

**Qué hace:** Módulos educativos de lengua Inga con video, frases, actividades interactivas (Completar, Emparejar) y sistema de progreso con puntos
**Tablas:** `modulos` · `secciones` · `actividades` · `progreso_usuario` · `puntos`
**Endpoints clave:** `GET /api/modulos` · `GET /api/modulos/:clave` · `POST /api/modulos/:clave/responder` · `GET /api/modulos/:clave/progreso`
**Archivos:** `backend/src/modules/modulos/modulos.controller.js` · `frontend/src/cartilla-inga/views/VistaModulo.tsx` · `components/activities/CompletarActividad.tsx` · `EmparejarActividad.tsx`
**⚠️ Regla crítica:** Cada respuesta correcta suma +10 puntos. El endpoint `responder` valida la respuesta y actualiza `progreso_usuario` y `puntos` en la misma transacción — no separar esas dos escrituras.
