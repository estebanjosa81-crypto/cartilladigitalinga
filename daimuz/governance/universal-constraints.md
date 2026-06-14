# Restricciones Universales

Estas reglas no se rompen sin discutirlo primero.

## Seguridad

- **Nunca** exponer JWT secret, credenciales de BD o API keys en el código
- **Siempre** pasar por middleware `auth` en rutas que requieren autenticación
- **Siempre** usar middleware `adminOnly` en rutas del panel de administración
- Las contraseñas se hashean con `bcryptjs` (rounds = 12) — nunca en texto plano
- Login **siempre** llama `bcrypt.compare` con `FAKE_HASH` si el usuario no existe — no retornar antes
- Helmet activado + CORS restringido a `ALLOWED_ORIGINS` (env var)
- Rate limiting: 20 req/15min en `/api/auth`, 120 req/min en `/api`
- `stripHtml()` en todo contenido de texto que viene del usuario antes de guardar

## Base de datos

- Usar el **pool** de conexiones en `backend/src/config/db.js` (hasta 20 conexiones, timezone UTC)
- Usar **prepared statements** (`?`) para prevenir SQL injection — nunca interpolar strings
- Writes que tocan >1 tabla van en `beginTransaction / commit / rollback`
- Batch load con `IN(?)` cuando se necesitan detalles de N filas — no loops de queries
- La estructura de la BD está en `backend/cartilladigitalinga.sql`

## API

- Todas las rutas van bajo el prefijo `/api`
- Los errores se centralizan en `backend/src/middleware/errorHandler.js` (con mapeo de códigos MySQL)
- Respuestas de error: `{ error: "mensaje" }` — en producción, 5xx no expone detalles internos
- Listas que pueden ser grandes van paginadas: `{ data, page, pageSize, total, hasMore }`
- `validarId()` en todos los parámetros de ruta que son IDs numéricos

## Frontend

- El estado global vive en `AppContext.tsx` — no duplicar estado en componentes
- Los tipos TypeScript se definen en `types/index.ts`
- Las llamadas al API van a través de `services/api.ts` (nunca `fetch` directo en componentes)
- `ApiError` tipado — capturar `.status` para diferenciar 401/403/5xx
- `AbortController` en `useEffect` que dispara fetch — cancelar en el cleanup
- Solo YouTube/Vimeo en iframes — usar `safeVideoUrl()` antes de asignar `src`
- Iconos: usar `utils/iconMap.ts` para consistencia

## UX de errores

- **Nunca** usar `alert()` para errores de auth — usar `errorAuth` del contexto
- Formularios de login/registro deshabilitan inputs y botón durante `cargandoAuth`
- Errores de red (status 0) y timeout (status 408) deben mostrar mensaje de conectividad

## Archivos

- No subir `node_modules/`, `.env`, ni `dist/`
- Variables de entorno del backend: `backend/.env`
- Variables de entorno del frontend: `frontend/.env`

← [[DAIMUZ]]
