require('dotenv').config();

const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Rutas
const authRoutes = require('./modules/auth/auth.routes');
const usuariosRoutes = require('./modules/usuarios/usuarios.routes');
const modulosRoutes = require('./modules/modulos/modulos.routes');
const retosRoutes = require('./modules/retos/retos.routes');
const comunidadRoutes = require('./modules/comunidad/comunidad.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const seccionesRoutes   = require('./modules/secciones/secciones.routes');
const vocabularioRoutes = require('./modules/vocabulario/vocabulario.routes');

const app = express();

// Middleware global
app.use(cors());
app.use(express.json());

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/modulos', modulosRoutes);
app.use('/api/retos', retosRoutes);
app.use('/api/comunidad', comunidadRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/secciones',   seccionesRoutes);
app.use('/api/vocabulario', vocabularioRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
