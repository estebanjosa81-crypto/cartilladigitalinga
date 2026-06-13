# Cartilla Digital Inga — Claude Instructions

Lee `daimuz/DAIMUZ.md` primero. Ahí está el mapa completo del proyecto.

## Regla de exploración

Antes de tocar cualquier archivo, consulta:
1. `daimuz/DAIMUZ.md` → mapa general
2. `daimuz/modules/[modulo]/compressed.md` → contexto del módulo específico
3. `daimuz/memory/current-state.md` → estado actual del proyecto
4. `daimuz/governance/universal-constraints.md` → restricciones que no se rompen

## Stack

- **Backend:** Node.js + Express 5 + MySQL2 + JWT + Cloudinary
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Auth:** JWT (7 días) + Google OAuth

## Comandos rápidos

```bash
# Backend
cd backend && npm run dev       # nodemon src/app.js

# Frontend
cd frontend && pnpm dev         # vite dev server
```
