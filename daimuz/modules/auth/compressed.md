# Auth — Compressed

**Qué hace:** Registro, login con email/contraseña y Google OAuth, obtención de perfil autenticado
**Tablas:** `usuarios`
**Endpoints clave:** `POST /api/auth/registro` · `POST /api/auth/login` · `POST /api/auth/google` · `GET /api/auth/perfil`
**Archivos:** `backend/src/modules/auth/auth.controller.js` · `backend/src/modules/auth/auth.routes.js` · `backend/src/middleware/auth.js`
**⚠️ Regla crítica:** El JWT se firma con `JWT_SECRET` del `.env` y expira en 7 días. El middleware `auth` extrae y verifica el token del header `Authorization: Bearer <token>`. El frontend lo guarda en `localStorage`.
