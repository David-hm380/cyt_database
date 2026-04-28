const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ...

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log('🔍 Login attempt received:');
    console.log('  - Username:', username);
    console.log('  - Password provided:', password ? 'Yes' : 'No');

    const usernameLower = username.toLowerCase();
    console.log('  - Username lower:', usernameLower);

    // Buscar usuario
    console.log('🔍 Executing query...');
    const userResult = await pool.query(
      'SELECT * FROM usuarios WHERE username = $1',
      [usernameLower]
    );

    console.log('🔍 Query result:');
    console.log('  - Rows found:', userResult.rows.length);
    console.log('  - User data:', userResult.rows[0] || 'No user found');

    if (userResult.rows.length === 0) {
      console.log('❌ User not found in database');
      return res.status(400).json({ message: 'Usuario no existe' });
    }

    const user = userResult.rows[0];
    console.log('✅ User found:', user.nombre, 'Active:', user.activo);

    // Verificar si está activo
    if (!user.activo) {
      console.log('❌ User is inactive');
      return res.status(403).json({ message: 'Usuario desactivado' });
    }

    // Comparar password
    console.log('🔍 Comparing passwords...');
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('  - Password valid:', validPassword);

    if (!validPassword) {
      console.log('❌ Invalid password');
      return res.status(400).json({ message: 'Password incorrecto' });
    }

    // Obtener permisos
    console.log('🔍 Getting user permissions...');
    const permisosResult = await pool.query(
      'SELECT modulo, acceso FROM permisos WHERE usuario_id = $1',
      [user.id]
    );

    const permisos = {};
    permisosResult.rows.forEach(p => {
      permisos[p.modulo] = p.acceso;
    });
    console.log('✅ Permissions loaded:', permisos);

    // Crear token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      'secreto',
      { expiresIn: '8h' }
    );

    console.log('✅ Login successful for:', user.username);
    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        username: user.username
      },
      permisos
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).send('Error en login');
  }
};

const createUser = async (req, res) => {
  try {
    const { nombre, username, password, permisos } = req.body;

    const usernameLower = username.toLowerCase();

    // Encriptar password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const userResult = await pool.query(
      `INSERT INTO usuarios (nombre, username, password)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [nombre, usernameLower, hashedPassword]
    );

    const userId = userResult.rows[0].id;

    // Insertar permisos
    const modulos = Object.keys(permisos);

    for (let modulo of modulos) {
      await pool.query(
        `INSERT INTO permisos (usuario_id, modulo, acceso)
         VALUES ($1, $2, $3)`,
        [userId, modulo, permisos[modulo]]
      );
    }

    res.json({ message: 'Usuario creado correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error creando usuario');
  }
};

const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, username, activo FROM usuarios'
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).send('Error obteniendo usuarios');
  }
};

const getUserPermissions = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT modulo, acceso FROM permisos WHERE usuario_id = $1',
      [id]
    );

    const permisos = {};
    result.rows.forEach(p => {
      permisos[p.modulo] = p.acceso;
    });

    res.json(permisos);

  } catch (error) {
    res.status(500).send('Error obteniendo permisos');
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, password, permisos } = req.body;

    // actualizar nombre
    await pool.query(
      'UPDATE usuarios SET nombre = $1 WHERE id = $2',
      [nombre, id]
    );

    // actualizar password si viene
    if (password) {
      const hashed = await bcrypt.hash(password, 10);

      await pool.query(
        'UPDATE usuarios SET password = $1 WHERE id = $2',
        [hashed, id]
      );
    }

    // 🔥 BORRAR permisos actuales
    await pool.query(
      'DELETE FROM permisos WHERE usuario_id = $1',
      [id]
    );

    // 🔥 INSERTAR nuevos permisos
    const modulos = Object.keys(permisos);

    for (let modulo of modulos) {
      await pool.query(
        `INSERT INTO permisos (usuario_id, modulo, acceso)
         VALUES ($1, $2, $3)`,
        [id, modulo, permisos[modulo]]
      );
    }

    res.json({ message: 'Usuario actualizado' });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error actualizando usuario');
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM permisos WHERE usuario_id = $1', [id]);
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);

    res.json({ message: 'Usuario eliminado' });

  } catch (error) {
    res.status(500).send('Error eliminando usuario');
  }
};

module.exports = {
  createUser,
  loginUser,
  getUsers,
  getUserPermissions,
  updateUser,
  deleteUser
};