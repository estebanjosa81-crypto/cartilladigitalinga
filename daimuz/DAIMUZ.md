# DAIMUZ — Cartilla Digital Inga

> Plataforma educativa para enseñar la lengua Inga (Putumayo, Colombia)

## Mapa de documentación

| Archivo | Propósito |
|---------|-----------|
| `indexes/modules-index.md` | Índice de todos los módulos backend y frontend |
| `memory/current-state.md` | Estado actual del proyecto |
| `governance/universal-constraints.md` | Restricciones críticas que no se rompen |
| `context/current-sprint.md` | Sprint/tareas en curso |
| `modules/[x]/compressed.md` | 5 líneas por módulo, el mayor ahorro de tiempo |

## Módulos backend

→ [[modules/auth/compressed]]
→ [[modules/usuarios/compressed]]
→ [[modules/modulos/compressed]]
→ [[modules/retos/compressed]]
→ [[modules/comunidad/compressed]]
→ [[modules/admin/compressed]]
→ [[modules/secciones/compressed]]
→ [[modules/vocabulario/compressed]]

## Arquitectura en una línea

`Request → auth.js middleware → module router → controller → MySQL (mysql2 pool) → JSON response`

Frontend: `AppContext (estado global) → hooks → services/api.ts (axios-like fetch) → componentes`

## Rutas base

- Backend API: `http://localhost:3001/api`
- Frontend dev: `http://localhost:5173`

← [[memory/current-state]] | [[indexes/modules-index]]
