const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[DB] Conexion exitosa a MySQL - Base de datos: ${process.env.DB_NAME}`);
    console.log(`[DB] Host: ${process.env.DB_HOST} | Usuario: ${process.env.DB_USER}`);

    const [rows] = await connection.query('SELECT COUNT(*) AS total FROM information_schema.tables WHERE table_schema = ?', [process.env.DB_NAME]);
    console.log(`[DB] Tablas encontradas: ${rows[0].total}`);

    connection.release();
  } catch (err) {
    console.error(`[DB] Error de conexion: ${err.message}`);
    console.error(`[DB] Verifica las credenciales en .env y que MySQL este corriendo`);
  }
};

testConnection();

module.exports = pool;
