require('dotenv').config();
const express = require('express');
const pool = require('./db');

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.use(express.json());

const userRoutes = require('./routes/userRoutes');
const verifyToken = require('./middlewares/authMiddleware');
const terrenosRoutes = require('./modules/terrenos/terrenos.routes');

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

app.listen(3000, () => {
  console.log('Servidor corriendo');
});