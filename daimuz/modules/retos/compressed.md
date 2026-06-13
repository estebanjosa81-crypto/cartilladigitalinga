# Retos — Compressed

**Qué hace:** Expone los retos diarios de aprendizaje del Inga para gamificación
**Tablas:** `retos` · `retos_completados`
**Endpoints clave:** `GET /api/retos`
**Archivos:** `backend/src/modules/retos/retos.controller.js` · `backend/src/services/retosService.js` · `frontend/src/cartilla-inga/components/home/RetosDiarios.tsx` · `RetosFlotante.tsx`
**⚠️ Regla crítica:** La lógica de negocio de retos vive en `retosService.js`, no en el controller. El controller sólo llama al servicio. `RetosFlotante.tsx` es un widget persistente en todas las vistas — cambios en la API de retos lo afectan globalmente.
