const isProd = process.env.NODE_ENV === 'production';

// Mapeo de códigos de error MySQL a respuestas HTTP legibles
const MYSQL_ERROR_MAP = {
  ER_DUP_ENTRY:          { status: 409, message: 'El registro ya existe' },
  ER_NO_REFERENCED_ROW:  { status: 400, message: 'Referencia inválida' },
  ER_NO_REFERENCED_ROW_2:{ status: 400, message: 'Referencia inválida' },
  ER_ROW_IS_REFERENCED:  { status: 409, message: 'No se puede eliminar: tiene registros relacionados' },
  ER_ROW_IS_REFERENCED_2:{ status: 409, message: 'No se puede eliminar: tiene registros relacionados' },
  ER_DATA_TOO_LONG:      { status: 400, message: 'Datos demasiado largos para el campo' },
  ER_BAD_NULL_ERROR:     { status: 400, message: 'Campo requerido no puede ser nulo' },
  ECONNREFUSED:          { status: 503, message: 'Base de datos no disponible' },
  ETIMEDOUT:             { status: 503, message: 'Tiempo de espera agotado' },
};

const errorHandler = (err, req, res, _next) => {
  // Error de MySQL
  if (err.code && MYSQL_ERROR_MAP[err.code]) {
    const mapped = MYSQL_ERROR_MAP[err.code];
    console.error(`[Error DB] ${err.code}: ${err.message} — ${req.method} ${req.path}`);
    return res.status(mapped.status).json({ error: mapped.message });
  }

  // Error con status HTTP explícito (ej: errores propios de la app)
  const status = err.status || err.statusCode || 500;

  // En producción, no exponer detalles internos en errores 5xx
  const message = (status >= 500 && isProd)
    ? 'Error interno del servidor'
    : (err.message || 'Error interno del servidor');

  if (status >= 500) {
    console.error(`[Error ${status}] ${req.method} ${req.path} — ${err.message}`);
    if (!isProd) console.error(err.stack);
  }

  res.status(status).json({ error: message });
};

module.exports = errorHandler;
