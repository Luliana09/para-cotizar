const { Sequelize } = require('sequelize');
const config = require('../config/database.js');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    timezone: dbConfig.timezone,
    define: dbConfig.define,
    pool: dbConfig.pool
  }
);

// Importar modelos
const Usuario = require('./usuario')(sequelize, Sequelize.DataTypes);
const Cliente = require('./cliente')(sequelize, Sequelize.DataTypes);
const Cotizacion = require('./cotizacion')(sequelize, Sequelize.DataTypes);
const Configuracion = require('./configuracion')(sequelize, Sequelize.DataTypes);

// Definir relaciones
const db = {
  sequelize,
  Sequelize,
  Usuario,
  Cliente,
  Cotizacion,
  Configuracion
};

// Relaciones Usuario <-> Cotizacion
Usuario.hasMany(Cotizacion, {
  foreignKey: 'usuario_id',
  as: 'cotizaciones'
});
Cotizacion.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// Relaciones Cliente <-> Cotizacion
Cliente.hasMany(Cotizacion, {
  foreignKey: 'cliente_id',
  as: 'cotizaciones'
});
Cotizacion.belongsTo(Cliente, {
  foreignKey: 'cliente_id',
  as: 'cliente'
});

module.exports = db;
