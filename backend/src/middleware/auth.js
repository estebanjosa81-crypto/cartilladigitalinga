const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

const authOpcional = (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const token = header.split(' ')[1];
      req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // Token inválido — continuar sin usuario
    }
  }
  next();
};

// Solo accesible para role='admin'
const adminOnly = (req, res, next) => {
  if (!req.usuario || req.usuario.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol administrador.' });
  }
  next();
};

module.exports = { auth, authOpcional, adminOnly };
