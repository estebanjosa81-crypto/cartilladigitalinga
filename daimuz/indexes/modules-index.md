# Índice de Módulos

## Backend (`backend/src/modules/`)

| Módulo | Controller | Routes | Descripción |
|--------|-----------|--------|-------------|
| auth | `auth/auth.controller.js` | `auth/auth.routes.js` | Registro, login, Google OAuth, perfil |
| usuarios | `usuarios/usuarios.controller.js` | `usuarios/usuarios.routes.js` | Top aprendices, stats, miembros activos |
| modulos | `modulos/modulos.controller.js` | `modulos/modulos.routes.js` | Contenido educativo, respuestas, progreso |
| retos | `retos/retos.controller.js` | `retos/retos.routes.js` | Retos diarios |
| comunidad | `comunidad/comunidad.controller.js` | `comunidad/comunidad.routes.js` | Publicaciones, likes, comentarios |
| admin | `admin/admin.controller.js` | `admin/admin.routes.js` | Panel admin, CRUD completo, uploads |
| secciones | `secciones/secciones.controller.js` | `secciones/secciones.routes.js` | Banners, slides, contenido dinámico |
| vocabulario | `vocabulario/vocabulario.controller.js` | `vocabulario/vocabulario.routes.js` | Buscador Inga-Español |

**Servicios:** `backend/src/services/retosService.js`
**Middleware:** `backend/src/middleware/auth.js` · `backend/src/middleware/errorHandler.js`
**Config:** `backend/src/config/db.js` (pool MySQL2)
**Entry:** `backend/src/app.js`

## Frontend (`frontend/src/cartilla-inga/`)

| Categoría | Archivos |
|-----------|---------|
| Vistas | `views/VistaInicio.tsx` · `VistaModulo.tsx` · `VistaComunidad.tsx` · `VistaAuth.tsx` · `VistaAdmin.tsx` · `VistaTraductor.tsx` |
| Layout | `components/layout/Header.tsx` · `SideMenu.tsx` · `StatsModal.tsx` |
| Home | `components/home/` — 9 componentes (Banner, Hero, Módulos, Retos, Stats, etc.) |
| Actividades | `components/activities/CompletarActividad.tsx` · `EmparejarActividad.tsx` |
| Auth | `components/auth/LoginForm.tsx` · `RegisterForm.tsx` · `GoogleSignInButton.tsx` |
| Comunidad | `components/community/` — 5 componentes |
| Estado global | `context/AppContext.tsx` |
| Hooks | `hooks/useAuth.ts` · `useActividad.ts` · `useNavigation.ts` |
| API client | `services/api.ts` |
| Tipos | `types/index.ts` |
| Utils | `utils/iconMap.ts` |

← [[DAIMUZ]]
