const { Pool } = require('pg');

console.log('🔍 Database connection setup:');
console.log('  - DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('  - DB_HOST:', process.env.DB_HOST || 'Not set');
console.log('  - DB_NAME:', process.env.DB_NAME || 'Not set');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Test query on startup
pool.query('SELECT NOW()')
  .then(res => {
    console.log('✅ Database test query successful:', res.rows[0].now);
  })
  .catch(err => {
    console.error('❌ Database test query failed:', err);
  });

module.exports = pool;

