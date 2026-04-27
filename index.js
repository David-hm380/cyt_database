require('dotenv').config();
const express = require('express');
const pool = require('./db');
const cors = require('cors');

const app = express();

// CORS middleware - Usar cors package
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://cyt-database-1.onrender.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  optionsSuccessStatus: 200
}));

app.use(express.json());

const userRoutes = require('./userRoutes');
const verifyToken = require('./authMiddleware');
const terrenosRoutes = require('./terrenos.routes');
const filtersRoutes = require('./filters.routes');

app.use('/users', userRoutes);
app.use('/api/terrenos', terrenosRoutes);
app.use('/api/filtros', filtersRoutes);

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