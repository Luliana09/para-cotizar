const jwt = require('jsonwebtoken');
const db = require('../models');
const Usuario = db.Usuario;

// Verificar JWT y autenticar usuario
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Verificar si el token existe en el header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado - Token no proporcionado'
      });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar usuario
      const usuario = await Usuario.findByPk(decoded.id);

      if (!usuario || !usuario.activo) {
        return res.status(401).json({
          success: false,
          message: 'No autorizado - Usuario no encontrado o inactivo'
        });
      }

      // Agregar usuario al request
      req.usuario = {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      };

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado - Token inválido'
      });
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({
      success: false,
      message: 'Error en autenticación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verificar roles específicos
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: `El rol '${req.usuario.rol}' no tiene permiso para acceder a este recurso`
      });
    }
    next();
  };
};
