# Restricciones Universales

Estas reglas no se rompen sin discutirlo primero.

## Seguridad

- **Nunca** exponer JWT secret, credenciales de BD o API keys en el código
- **Siempre** pasar por middleware `auth` en rutas que requieren autenticación
- **Siempre** usar middleware `adminOnly` en rutas del panel de administración
- Las contraseñas se hashean con `bcryptjs` — nunca se guardan en texto plano

## Base de datos

- Usar el **pool** de conexiones en `backend/src/config/db.js`, no crear conexiones directas
- Usar **prepared statements** (parametrización `?`) para prevenir SQL injection
- La estructura de la BD está en `backend/cartilladigitalinga.sql`

## API

- Todas las rutas van bajo el prefijo `/api`
- Los errores se manejan en `backend/src/middleware/errorHandler.js`
- Respuestas de error usan formato: `{ error: "mensaje" }`
- Respuestas de éxito usan: `{ data/campo: valor }`

## Frontend

- El estado global vive en `AppContext.tsx` — no duplicar estado en componentes si ya existe en context
- Los tipos TypeScript se definen en `types/index.ts`
- Las llamadas al API van a través de `services/api.ts`, nunca con fetch directo en componentes
- Iconos: usar `utils/iconMap.ts` para consistencia

## Archivos

- No subir `node_modules/`, `.env`, ni `dist/` (ya cubiertos por `.gitignore`)
- Variables de entorno del backend: `backend/.env`
- Variables de entorno del frontend: `frontend/.env`

← [[DAIMUZ]]
