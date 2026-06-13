# Usuarios — Compressed

**Qué hace:** Expone rankings, estadísticas por usuario y lista de miembros activos de la comunidad
**Tablas:** `usuarios` · `progreso_usuario` · `puntos`
**Endpoints clave:** `GET /api/usuarios/top` · `GET /api/usuarios/:id/stats` · `GET /api/usuarios/activos`
**Archivos:** `backend/src/modules/usuarios/usuarios.controller.js` · `backend/src/modules/usuarios/usuarios.routes.js`
**⚠️ Regla crítica:** El top aprendices y los miembros activos se muestran en `VistaInicio` vía los componentes `TopAprendices.tsx` y `StatsSection.tsx` — cambios en la estructura de respuesta rompen esos componentes.
