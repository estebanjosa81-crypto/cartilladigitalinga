# Frontend API Layer — Compressed

**Qué hace:** Capa única de comunicación con el backend — todos los fetches pasan por aquí
**Archivo:** `frontend/src/cartilla-inga/services/api.ts`

**Clase de error:**
```ts
ApiError(status, message)  // .isUnauthorized (401) · .isForbidden (403) · .isServerError (5xx)
```

**Request base:**
- Timeout 15s via `AbortController` (uploads: 60s)
- 401 → `clearToken()` automático (limpia localStorage)
- Respuesta no-JSON manejada sin crash
- Error de red → `ApiError(0, "Sin conexión...")`
- Timeout → `ApiError(408, "La solicitud tardó...")`

**APIs exportadas:**
| Objeto | Métodos principales |
|--------|-------------------|
| `authAPI` | `login` · `registro` · `googleLogin` · `perfil` |
| `modulosAPI` | `listar` · `obtener(clave)` · `responder(clave, respuesta)` |
| `comunidadAPI` | `listarPublicaciones(page?)` → `PaginatedResponse<PublicacionAPI>` · `crearPublicacion` · `toggleLike` · `listarComentarios` · `crearComentario` |
| `retosAPI` | `listar` |
| `usuariosAPI` | `top` · `activos` · `stats(id)` |
| `traductorAPI` | `buscar(q)` — silencioso si q < 2 chars |
| `seccionesPublicAPI` | `getBanner` · `getActivas` |
| `adminAPI` | CRUD completo: usuarios, módulos, actividades, imágenes, secciones, audios, publicaciones |
| `uploadAPI` | `imagen(file)` · `audio(file)` — helper unificado con timeout |
| `bancoAPI` | CRUD vocabulario + textos del banco de conocimiento |

**⚠️ Reglas críticas:**
- No usar `fetch` directo en componentes — siempre `services/api.ts`
- `comunidadAPI.listarPublicaciones()` retorna `{ data, page, pageSize, total, hasMore }` — extraer `.data`
- `traductorAPI.buscar` con string vacío o < 2 chars retorna `{ resultados: [], total: 0 }` sin request
- `uploadAPI` no usa el helper `request` (multipart) — tiene su propio `AbortController`
