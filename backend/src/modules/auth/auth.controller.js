const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../../config/db');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Helpers de validación ─────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarRegistro(nombre, email, password) {
  if (!nombre || !email || !password) return 'Nombre, email y contraseña son requeridos';
  if (typeof nombre !== 'string' || nombre.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
  if (nombre.trim().length > 80) return 'El nombre no puede superar 80 caracteres';
  if (!EMAIL_RE.test(email)) return 'El email no tiene un formato válido';
  if (email.length > 120) return 'El email no puede superar 120 caracteres';
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  if (password.length > 100) return 'La contraseña no puede superar 100 caracteres';
  return null;
}

function sanitizarTexto(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/\0/g, ''); // Elimina null bytes
}

const generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, role: usuario.role || 'user' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ── Registro ──────────────────────────────────────────────────────────────────

exports.registro = async (req, res, next) => {
  try {
    const nombre   = sanitizarTexto(req.body.nombre   || '');
    const email    = sanitizarTexto(req.body.email    || '').toLowerCase();
    const password = req.body.password || '';

    const error = validarRegistro(nombre, email, password);
    if (error) return res.status(400).json({ error });

    const [existente] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existente.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
      [nombre, email, hash]
    );

    const [usuario] = await db.query(
      'SELECT id, nombre, email, avatar, nivel, role, puntos FROM usuarios WHERE id = ?',
      [result.insertId]
    );

    const token = generarToken(usuario[0]);
    res.status(201).json({
      token,
      usuario: { ...usuario[0], dias_seguidos: 0, palabras_aprendidas: 0 },
    });
  } catch (err) {
    next(err);
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────

// Hash falso para mitigar timing attack (ver debajo)
const FAKE_HASH = '$2a$12$Qg7xC5tWn2S3fEaKQz5GnO1y3Gep7ZKZZMeVJR1qTH8d1Bk5TjLuW';

exports.login = async (req, res, next) => {
  try {
    const email    = sanitizarTexto(req.body.email    || '').toLowerCase();
    const password = req.body.password || '';

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const [rows] = await db.query(
      'SELECT id, nombre, email, avatar, nivel, role, puntos, password, auth_provider, dias_seguidos, palabras_aprendidas FROM usuarios WHERE email = ?',
      [email]
    );

    const usuario = rows.length > 0 ? rows[0] : null;

    // Siempre se hace bcrypt.compare para evitar timing attack
    const hashComparar = usuario?.password || FAKE_HASH;
    const match = await bcrypt.compare(password, hashComparar);

    if (!usuario || !match) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (usuario.auth_provider === 'google' && !usuario.password) {
      return res.status(400).json({
        error: 'Esta cuenta usa Google para iniciar sesión. Usa el botón "Continuar con Google".',
      });
    }

    await db.query('UPDATE usuarios SET ultimo_acceso = CURDATE() WHERE id = ?', [usuario.id]);

    const token = generarToken(usuario);
    res.json({
      token,
      usuario: {
        id:                  usuario.id,
        nombre:              usuario.nombre,
        email:               usuario.email,
        avatar:              usuario.avatar,
        nivel:               usuario.nivel,
        role:                usuario.role || 'user',
        puntos:              usuario.puntos,
        dias_seguidos:       usuario.dias_seguidos ?? 0,
        palabras_aprendidas: usuario.palabras_aprendidas ?? 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Perfil ────────────────────────────────────────────────────────────────────

exports.perfil = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nombre, email, avatar, nivel, role, frase, puntos, dias_seguidos, palabras_aprendidas FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// ── Google OAuth ──────────────────────────────────────────────────────────────

exports.googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({ error: 'Token de Google requerido' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) return res.status(401).json({ error: 'Token de Google inválido' });

    const { sub: googleId, email, name } = payload;

    const [existingUsers] = await db.query(
      'SELECT id, nombre, email, avatar, nivel, role, puntos, dias_seguidos, palabras_aprendidas, google_id FROM usuarios WHERE google_id = ? OR email = ?',
      [googleId, email]
    );

    let usuario;

    if (existingUsers.length > 0) {
      usuario = existingUsers[0];

      if (!usuario.google_id) {
        await db.query(
          'UPDATE usuarios SET google_id = ?, auth_provider = ? WHERE id = ?',
          [googleId, 'google', usuario.id]
        );
      }
      await db.query('UPDATE usuarios SET ultimo_acceso = CURDATE() WHERE id = ?', [usuario.id]);
    } else {
      const avatares = ['🌱', '🌺', '🦜', '🌿', '⛰️', '🌸', '🌻', '🦋'];
      const avatarAleatorio = avatares[Math.floor(Math.random() * avatares.length)];

      const [result] = await db.query(
        `INSERT INTO usuarios (nombre, email, google_id, auth_provider, avatar, ultimo_acceso)
         VALUES (?, ?, ?, 'google', ?, CURDATE())`,
        [name, email, googleId, avatarAleatorio]
      );

      const [nuevoUsuario] = await db.query(
        'SELECT id, nombre, email, avatar, nivel, role, puntos, dias_seguidos, palabras_aprendidas FROM usuarios WHERE id = ?',
        [result.insertId]
      );
      usuario = nuevoUsuario[0];
    }

    const token = generarToken(usuario);
    res.json({
      token,
      usuario: {
        id:                  usuario.id,
        nombre:              usuario.nombre,
        email:               usuario.email,
        avatar:              usuario.avatar,
        nivel:               usuario.nivel,
        role:                usuario.role || 'user',
        puntos:              usuario.puntos,
        dias_seguidos:       usuario.dias_seguidos ?? 0,
        palabras_aprendidas: usuario.palabras_aprendidas ?? 0,
      },
    });
  } catch (err) {
    if (err.message?.includes('Token used too late') || err.message?.includes('Invalid token')) {
      return res.status(401).json({ error: 'Token de Google inválido o expirado' });
    }
    next(err);
  }
};
