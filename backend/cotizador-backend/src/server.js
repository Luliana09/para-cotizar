require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rutas básicas
app.get('/', (req, res) => {
  res.json({
    message: '🏢 API Sistema de Cotización',
    version: '1.0.0',
    status: 'online',
    database: db.sequelize.config.database
  });
});

app.get('/health', async (req, res) => {
  try {
    await db.sequelize.authenticate();
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Importar rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/cotizaciones', require('./routes/cotizaciones'));

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Sincronizar base de datos y arrancar servidor
const startServer = async () => {
  try {
    // Testear conexión
    await db.sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida correctamente');

    // Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      // await db.sequelize.sync({ alter: true });
      console.log('📊 Modelos sincronizados');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
      console.log(`📦 Base de datos: ${db.sequelize.config.database}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
