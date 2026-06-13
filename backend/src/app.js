require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

// Rutas
const authRoutes       = require('./modules/auth/auth.routes');
const usuariosRoutes   = require('./modules/usuarios/usuarios.routes');
const modulosRoutes    = require('./modules/modulos/modulos.routes');
const retosRoutes      = require('./modules/retos/retos.routes');
const comunidadRoutes  = require('./modules/comunidad/comunidad.routes');
const adminRoutes      = require('./modules/admin/admin.routes');
const seccionesRoutes  = require('./modules/secciones/secciones.routes');
const vocabularioRoutes = require('./modules/vocabulario/vocabulario.routes');

const app = express();

// ── Seguridad ─────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Permite imágenes externas (Cloudinary)
}));

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, cb) => {
    // Permitir requests sin origin (ej: Postman, curl)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`Origin no permitido: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate limiting ──────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  message: { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 120,
  message: { error: 'Demasiadas solicitudes. Intenta de nuevo en un momento.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

// ── Body parsing ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ── Rutas API ─────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/usuarios',   usuariosRoutes);
app.use('/api/modulos',    modulosRoutes);
app.use('/api/retos',      retosRoutes);
app.use('/api/comunidad',  comunidadRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/secciones',  seccionesRoutes);
app.use('/api/vocabulario', vocabularioRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Server] http://localhost:${PORT} — env: ${process.env.NODE_ENV || 'development'}`);
});
