import { createPool } from 'mariadb';

const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10
});

pool.getConnection()
  .then((conn) => {
    console.log('DB connectée');
    conn.release();
  })
  .catch((err) => {
    console.error('DB erreur:', err.message);
    if (err.cause) console.error('Cause:', err.cause);
  });

export default pool;
