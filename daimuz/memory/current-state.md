# Estado Actual del Proyecto

**Última actualización:** 2026-06-13

## Estado general

- Proyecto: **activo / en desarrollo**
- Repositorio: `https://github.com/estebanjosa81-crypto/cartilladigitalinga.git`
- Branch principal: `main`
- Último commit: `48282a9` — feat: full backend + frontend security/performance audit

## Qué funciona

- [x] Autenticación completa (JWT 7d + Google OAuth) — con timing attack fix
- [x] Módulos educativos: video (YouTube/Vimeo), secciones, imágenes, audios
- [x] Actividades: Completar, Emparejar, Verdadero/Falso, Ordenar — carga batch sin N+1
- [x] Sistema de puntos y progreso por módulo — en transacción atómica
- [x] Retos diarios con gamificación
- [x] Comunidad: publicaciones paginadas, comentarios, likes — todas en transacción
- [x] Panel de administración (CRUD completo + upload Cloudinary)
- [x] Buscador de vocabulario Inga-Español (mín. 2 chars antes de disparar request)
- [x] Banners/slides dinámicos con fallback de 3 slides en gradiente
- [x] Top aprendices y estadísticas
- [x] Diseño institucional MinSalud: header 3 capas GOV.CO + navbar verde + footer

## Seguridad implementada (post-auditoría)

- Helmet + CORS whitelist (`ALLOWED_ORIGINS` env)
- Rate limiting: 20 req/15min en `/api/auth`, 120 req/min en `/api`
- bcrypt rounds = 12, FAKE_HASH para mitigar timing attack en login
- XSS: `stripHtml()` en contenido de comunidad
- `safeVideoUrl()` en frontend — solo YouTube/Vimeo permitidos en iframes
- 401 en frontend auto-limpia el token de `localStorage`

## Capas de la API frontend (`services/api.ts`)

- `ApiError` tipado con `.status`, `.isUnauthorized`, `.isServerError`
- Timeout de 15s por request (60s en uploads) via `AbortController`
- `comunidadAPI.listarPublicaciones(page)` → `PaginatedResponse<PublicacionAPI>`
- `uploadAPI.imagen(file)` / `.audio(file)` — helper unificado con error tipado

## UX de Auth

- `cargandoAuth` + `errorAuth` en `AppContext` — reemplazan todos los `alert()`
- Formularios deshabilitan inputs y muestran texto de carga durante submit
- Error se muestra en banner rojo inline (no modal/alert)

## Infraestructura

- **BD:** MySQL local — pool de hasta 20 conexiones (`DB_CONNECTION_LIMIT` env), timezone UTC
- **Storage:** Cloudinary (imágenes y audios)
- **Auth tokens:** JWT en `localStorage`; auto-limpiado en 401

## Pendiente / por definir

- [ ] Despliegue en producción
- [ ] Tests automatizados
- [ ] Carga infinita / "cargar más" en comunidad (backend paginado, frontend aún carga solo página 1)
- [ ] Notificaciones en tiempo real

← [[DAIMUZ]] | [[context/current-sprint]]
