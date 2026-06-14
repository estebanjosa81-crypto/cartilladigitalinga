# Auth — Compressed

**Qué hace:** Registro, login con email/contraseña y Google OAuth, perfil autenticado
**Tablas:** `usuarios`
**Endpoints clave:** `POST /api/auth/registro` · `POST /api/auth/login` · `POST /api/auth/google` · `GET /api/auth/perfil`
**Archivos:** `backend/src/modules/auth/auth.controller.js` · `backend/src/middleware/auth.js`
**⚠️ Reglas críticas:**
- JWT firmado con `JWT_SECRET`, expira 7 días. Frontend lo guarda en `localStorage`; se auto-limpia al recibir 401.
- Login usa `FAKE_HASH` siempre que el usuario no exista — evita timing attack (`bcrypt.compare` siempre corre, rounds=12).
- Registro valida: email regex, nombre 2–80 chars, password 6–100 chars, `sanitizarTexto()` elimina null bytes.
- Seleccionar campos explícitos en SELECT (no `SELECT *`).
