# Cartilla Digital Inga

## Descripcion del Proyecto

**Cartilla Digital Inga** es una plataforma educativa interactiva diseñada para enseñar la lengua Inga, un idioma nativo del Putumayo, Colombia. La aplicacion combina tecnologia moderna con gamificacion para hacer el aprendizaje del idioma accesible y entretenido.

---

## Estructura del Proyecto

```
cartilladigitalinga/
├── backend/                          # API REST con Express.js
│   ├── src/
│   │   ├── app.js                   # Punto de entrada del servidor
│   │   ├── config/
│   │   │   └── db.js                # Configuracion de conexion MySQL
│   │   ├── middleware/
│   │   │   ├── auth.js              # Middleware de JWT
│   │   │   └── errorHandler.js      # Manejo global de errores
│   │   ├── modules/
│   │   │   ├── auth/                # Autenticacion (login, registro, Google OAuth)
│   │   │   ├── usuarios/            # Gestion de usuarios y estadisticas
│   │   │   ├── modulos/             # Modulos educativos
│   │   │   ├── retos/               # Retos diarios
│   │   │   └── comunidad/           # Caracteristicas de comunidad
│   │   └── services/
│   │       └── retosService.js      # Logica de retos diarios
│   ├── package.json
│   └── .env
│
├── frontend/                         # Aplicacion React + TypeScript
│   ├── src/
│   │   ├── main.tsx                 # Punto de entrada React
│   │   ├── App.tsx                  # Componente raiz
│   │   ├── cartilla-inga/
│   │   │   ├── CartillaIngaDigital.tsx    # Componente principal
│   │   │   ├── components/
│   │   │   │   ├── layout/          # Header, SideMenu, StatsModal
│   │   │   │   ├── home/            # Hero, Stats, Modulos, Retos
│   │   │   │   ├── auth/            # Autenticacion UI
│   │   │   │   ├── activities/      # Actividades interactivas
│   │   │   │   └── community/       # Publicaciones, posts
│   │   │   ├── context/
│   │   │   │   └── AppContext.tsx   # Estado global
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts       # Hook de autenticacion
│   │   │   │   ├── useNavigation.ts # Hook de navegacion
│   │   │   │   └── useActividad.ts  # Hook de actividades
│   │   │   ├── views/
│   │   │   │   ├── VistaInicio.tsx
│   │   │   │   ├── VistaModulo.tsx
│   │   │   │   ├── VistaComunidad.tsx
│   │   │   │   └── VistaAuth.tsx
│   │   │   ├── services/
│   │   │   │   └── api.ts           # Cliente API tipado
│   │   │   ├── types/
│   │   │   │   └── index.ts         # Tipos TypeScript
│   │   │   └── utils/
│   │   │       └── iconMap.ts       # Mapeo de iconos
│   │   └── index.css
│   ├── public/
│   ├── dist/                        # Build de produccion
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── .env
│
└── info.md                          # Este archivo
```

---

## Tecnologias Utilizadas

### Backend
| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| Node.js | - | Runtime |
| Express.js | 5.2.1 | Framework web |
| MySQL 2 | 3.16.2 | Base de datos |
| jsonwebtoken | 9.0.3 | Autenticacion JWT |
| bcryptjs | 3.0.3 | Hash de contraseñas |
| google-auth-library | 10.5.0 | OAuth con Google |
| cors | 2.8.6 | Middleware CORS |
| dotenv | 17.2.3 | Variables de entorno |
| nodemon | 3.1.11 | Desarrollo (hot reload) |

### Frontend
| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| React | 18.3.1 | Framework UI |
| TypeScript | 5.6.2 | Tipado estatico |
| Vite | 6.0.5 | Bundler y dev server |
| Tailwind CSS | 3.4.17 | Estilos utilitarios |
| Lucide React | 0.469.0 | Iconografia |
| @react-oauth/google | 0.13.4 | Login con Google |
| ESLint | 9.17.0 | Linting |

---

## Funcionalidades Principales

### 1. Modulos Educativos
- Contenido organizado en modulos tematicos
- Cada modulo incluye video educativo
- Frases en Inga con traducciones al español
- Dos tipos de actividades interactivas por modulo

### 2. Actividades Interactivas
- **Completar**: Selecciona la respuesta correcta entre multiples opciones
- **Emparejar**: Conecta palabras en Inga con su traduccion en español

### 3. Sistema de Gamificacion
- **Puntos**: +10 puntos por respuesta correcta
- **Retos diarios**: Vocabulario, conversacion, modulos, comunidad
- **Estadisticas**: Puntos totales, dias seguidos, palabras aprendidas
- **Ranking**: Top aprendices visible en la plataforma

### 4. Comunidad
- Publicaciones entre usuarios
- Sistema de likes
- Comentarios en publicaciones
- Ranking de mejores aprendices

### 5. Autenticacion
- Registro con email y contraseña
- Login tradicional
- Autenticacion con Google OAuth
- Sesiones persistentes con JWT (7 dias)

---

## API Endpoints

### Autenticacion
| Endpoint | Metodo | Auth | Descripcion |
|----------|--------|------|-------------|
| `/auth/registro` | POST | No | Crear cuenta nueva |
| `/auth/login` | POST | No | Iniciar sesion |
| `/auth/google` | POST | No | Login con Google |
| `/auth/perfil` | GET | Si | Obtener datos del usuario |

### Usuarios
| Endpoint | Metodo | Auth | Descripcion |
|----------|--------|------|-------------|
| `/usuarios/top` | GET | No | Top 5 usuarios por puntos |
| `/usuarios/activos` | GET | No | Contador de usuarios activos |
| `/usuarios/{id}/stats` | GET | No | Estadisticas de un usuario |

### Modulos
| Endpoint | Metodo | Auth | Descripcion |
|----------|--------|------|-------------|
| `/modulos` | GET | No | Listar todos los modulos |
| `/modulos/{clave}` | GET | No | Detalle de un modulo |
| `/modulos/{clave}/responder` | POST | Si | Enviar respuesta de actividad |

### Retos
| Endpoint | Metodo | Auth | Descripcion |
|----------|--------|------|-------------|
| `/retos` | GET | Opcional | Listar retos con progreso |

### Comunidad
| Endpoint | Metodo | Auth | Descripcion |
|----------|--------|------|-------------|
| `/comunidad/publicaciones` | GET | No | Listar publicaciones |
| `/comunidad/publicaciones` | POST | Si | Crear publicacion |
| `/comunidad/publicaciones/{id}/like` | POST | Si | Dar/quitar like |
| `/comunidad/publicaciones/{id}/comentarios` | GET | No | Ver comentarios |
| `/comunidad/publicaciones/{id}/comentarios` | POST | Si | Crear comentario |

---

## Configuracion

### Variables de Entorno - Backend (.env)
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=cartilladigitalinga
JWT_SECRET=cartilla_inga_secret_key_cambiar_en_produccion
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=tu_google_client_id
```

### Variables de Entorno - Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=tu_google_client_id
```

---

## Comandos de Desarrollo

### Backend
```bash
cd backend
npm install          # Instalar dependencias
npm run dev          # Iniciar con nodemon (desarrollo)
npm start            # Iniciar en produccion
```

### Frontend
```bash
cd frontend
npm install          # Instalar dependencias
npm run dev          # Servidor de desarrollo Vite
npm run build        # Build de produccion
npm run preview      # Preview del build
npm run lint         # Ejecutar ESLint
```

---

## Arquitectura del Frontend

### Estado Global (Context API)
El `AppContext` maneja:
- **Auth**: usuario, token, vistaAuth (login/registro)
- **Navegacion**: vistaActual (inicio/modulo/comunidad/auth)
- **Datos API**: modulos, retos, publicaciones, topUsuarios
- **Actividades**: respuestas seleccionadas, pares emparejados
- **Puntuacion**: puntos, dias seguidos, palabras aprendidas

### Hooks Personalizados
- `useAuth`: Acceso al estado de autenticacion
- `useNavigation`: Control de navegacion entre vistas
- `useActividad`: Logica de actividades interactivas

### Componentes Principales
- **Layout**: Header, SideMenu, StatsModal
- **Home**: HeroSection, ModulosDestacados, RetosDiarios, TopAprendices
- **Activities**: CompletarActividad, EmparejarActividad
- **Auth**: LoginForm, RegisterForm, GoogleSignInButton
- **Community**: PostCard, PostForm, CommunityHero

---

## Flujo de Autenticacion

1. Usuario registra o inicia sesion
2. Backend genera token JWT
3. Token se guarda en localStorage
4. Cada request autenticado incluye header: `Authorization: Bearer {token}`
5. Middleware valida el token
6. Datos del usuario disponibles en `req.usuario`

---

## Sistema de Puntos

| Accion | Puntos |
|--------|--------|
| Respuesta correcta en actividad | +10 |
| Completar reto diario | Variable segun reto |

El progreso se actualiza en tiempo real y se refleja en:
- Barra de progreso de cada reto
- Estadisticas del usuario
- Ranking de top aprendices

---

## Caracteristicas Tecnicas

- **Responsivo**: Diseño mobile-first con breakpoints personalizados
- **Tipado completo**: TypeScript en todo el frontend
- **Seguridad**: Hash bcrypt, JWT con expiracion, validacion de inputs
- **Base de datos**: MySQL con pool de conexiones
- **Iconografia dinamica**: Mapeo de iconos Lucide React
- **Build optimizado**: Vite para desarrollo rapido y builds eficientes

---

## Estadisticas del Proyecto

| Aspecto | Cantidad |
|---------|----------|
| Archivos Frontend (TS/TSX) | 45 |
| Archivos Backend (JS) | 15 |
| Modulos Backend | 5 |
| Componentes React | 20+ |
| Endpoints API | 17+ |
| Dependencias Backend | 8 |
| Dependencias Frontend | 7 principales |

---

## Sobre la Lengua Inga

La lengua Inga es un idioma nativo hablado principalmente en el departamento del Putumayo, Colombia. Esta plataforma busca preservar y promover el aprendizaje de esta lengua ancestral a traves de tecnologia moderna y metodos de enseñanza interactivos.
