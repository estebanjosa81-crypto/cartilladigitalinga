const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../../config/db');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, role: usuario.role || 'user' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

exports.registro = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    const [existente] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existente.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
      [nombre, email, hash]
    );

    const [usuario] = await db.query(
      'SELECT id, nombre, email, avatar, nivel, role, puntos FROM usuarios WHERE id = ?',
      [result.insertId]
    );

    const token = generarToken(usuario[0]);
    res.status(201).json({ token, usuario: { ...usuario[0], dias_seguidos: 0, palabras_aprendidas: 0 } });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = rows[0];

    // Verificar si el usuario usa solo Google
    if (usuario.auth_provider === 'google' && !usuario.password) {
      return res.status(400).json({
        error: 'Esta cuenta usa Google para iniciar sesión. Usa el botón "Continuar con Google".'
      });
    }

    const match = await bcrypt.compare(password, usuario.password);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Actualizar último acceso y racha de días
    await db.query('UPDATE usuarios SET ultimo_acceso = CURDATE() WHERE id = ?', [usuario.id]);

    const token = generarToken(usuario);
    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        avatar: usuario.avatar,
        nivel: usuario.nivel,
        role: usuario.role || 'user',
        puntos: usuario.puntos,
        dias_seguidos: usuario.dias_seguidos,
        palabras_aprendidas: usuario.palabras_aprendidas
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.perfil = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nombre, email, avatar, nivel, role, frase, puntos, dias_seguidos, palabras_aprendidas FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Token de Google requerido' });
    }

    // Verificar el token con Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // Buscar usuario existente por google_id o email
    const [existingUsers] = await db.query(
      'SELECT * FROM usuarios WHERE google_id = ? OR email = ?',
      [googleId, email]
    );

    let usuario;

    if (existingUsers.length > 0) {
      usuario = existingUsers[0];

      // Si el usuario existe con email pero sin google_id, vincular la cuenta
      if (!usuario.google_id) {
        await db.query(
          'UPDATE usuarios SET google_id = ?, auth_provider = ? WHERE id = ?',
          [googleId, 'google', usuario.id]
        );
      }

      // Actualizar último acceso
      await db.query('UPDATE usuarios SET ultimo_acceso = CURDATE() WHERE id = ?', [usuario.id]);
    } else {
      // Crear nuevo usuario con Google
      const avatares = ['🌱', '🌺', '🦜', '🌿', '⛰️', '🌸', '🌻', '🦋'];
      const avatarAleatorio = avatares[Math.floor(Math.random() * avatares.length)];

      const [result] = await db.query(
        `INSERT INTO usuarios (nombre, email, google_id, auth_provider, avatar, ultimo_acceso)
         VALUES (?, ?, ?, 'google', ?, CURDATE())`,
        [name, email, googleId, avatarAleatorio]
      );

      const [nuevoUsuario] = await db.query(
        'SELECT * FROM usuarios WHERE id = ?',
        [result.insertId]
      );
      usuario = nuevoUsuario[0];
    }

    const token = generarToken(usuario);

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        avatar: usuario.avatar,
        nivel: usuario.nivel,
        role: usuario.role || 'user',
        puntos: usuario.puntos,
        dias_seguidos: usuario.dias_seguidos ?? 0,
        palabras_aprendidas: usuario.palabras_aprendidas ?? 0
      }
    });
  } catch (err) {
    console.error('Error en Google Auth:', err);

    if (err.message?.includes('Token used too late') || err.message?.includes('Invalid token')) {
      return res.status(401).json({ error: 'Token de Google inválido o expirado' });
    }

    next(err);
  }
};
