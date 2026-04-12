require('dotenv').config();
const express = require('express');
const pool = require('./db');

// Debug logging
console.log('=== ENVIRONMENT VARIABLES ===');
console.log('DB_USER:', process.env.DB_USER);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + '...' : 'NOT_SET');
console.log('================================');

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.use(express.json());

const userRoutes = require('./userRoutes');
const verifyToken = require('./authMiddleware');
const terrenosRoutes = require('./terrenos.routes');

app.use('/users', userRoutes);
app.use('/api/terrenos', terrenosRoutes);

app.get('/protected', verifyToken, (req, res) => {
  res.json({
    message: 'Acceso permitido',
    user: req.user
  });
});


app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en conexión');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Servidor corriendo en puerto', PORT);
});