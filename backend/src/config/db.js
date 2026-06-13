const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:             process.env.DB_HOST,
  user:             process.env.DB_USER,
  password:         process.env.DB_PASSWORD,
  database:         process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:  parseInt(process.env.DB_CONNECTION_LIMIT) || 20,
  queueLimit:       0,
  charset:          'utf8mb4',
  timezone:         '+00:00',
});

// Test de conexión al arrancar — sin exponer credenciales en logs
const testConnection = async () => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      'SELECT COUNT(*) AS total FROM information_schema.tables WHERE table_schema = ?',
      [process.env.DB_NAME]
    );
    console.log(`[DB] Conectado a "${process.env.DB_NAME}" — ${rows[0].total} tablas`);
    conn.release();
  } catch (err) {
    console.error(`[DB] Error de conexión: ${err.message}`);
    console.error('[DB] Verifica las variables de entorno DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
  }
};

testConnection();

module.exports = pool;
