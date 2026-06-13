# Vocabulario — Compressed

**Qué hace:** Motor de búsqueda de palabras Inga-Español para el módulo traductor
**Tablas:** `vocabulario`
**Endpoints clave:** `GET /api/vocabulario/buscar?q=palabra`
**Archivos:** `backend/src/modules/vocabulario/vocabulario.controller.js` · `frontend/src/cartilla-inga/views/VistaTraductor.tsx`
**⚠️ Regla crítica:** La búsqueda es bidireccional (Inga→Español y Español→Inga) con LIKE en ambas columnas. No asumir dirección única. El admin gestiona el vocabulario vía `/api/admin/vocabulario`.
