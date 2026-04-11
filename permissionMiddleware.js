const pool = require('../db');

const checkPermission = (modulo) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      const result = await pool.query(
        'SELECT acceso FROM permisos WHERE usuario_id = $1 AND modulo = $2',
        [userId, modulo]
      );

      if (result.rows.length === 0 || !result.rows[0].acceso) {
        return res.status(403).json({
          message: 'No tienes acceso a este módulo'
        });
      }

      next();

    } catch (error) {
      console.error(error);
      res.status(500).send('Error verificando permisos');
    }
  };
};

module.exports = checkPermission;