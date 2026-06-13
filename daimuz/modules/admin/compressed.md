# Admin — Compressed

**Qué hace:** Panel de administración con CRUD completo de usuarios, módulos, actividades, secciones, audios, vocabulario, textos e imágenes; también maneja uploads a Cloudinary
**Tablas:** todas las tablas del sistema
**Endpoints clave:** `GET /api/admin/stats` · `/api/admin/usuarios` · `/api/admin/modulos` · `/api/admin/actividades` · `/api/admin/secciones` · `/api/admin/vocabulario` · `POST /api/admin/upload`
**Archivos:** `backend/src/modules/admin/admin.controller.js` (57 métodos) · `backend/src/modules/admin/admin.routes.js` · `frontend/src/cartilla-inga/views/VistaAdmin.tsx`
**⚠️ Regla crítica:** Todas las rutas de admin requieren middleware `adminOnly` (que internamente llama a `auth` primero). El upload usa `multer` + `cloudinary` — los archivos no se guardan localmente, van directo a Cloudinary. No reducir permisos del middleware en rutas existentes.
