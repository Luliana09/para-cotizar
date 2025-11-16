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
const Departamento = require('./departamento')(sequelize, Sequelize.DataTypes);
const Ticket = require('./ticket')(sequelize, Sequelize.DataTypes);
const TicketMensaje = require('./ticketMensaje')(sequelize, Sequelize.DataTypes);

// Definir relaciones
const db = {
  sequelize,
  Sequelize,
  Usuario,
  Cliente,
  Cotizacion,
  Configuracion,
  Departamento,
  Ticket,
  TicketMensaje
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

// Relaciones Ticket <-> Cotizacion
Cotizacion.hasOne(Ticket, {
  foreignKey: 'cotizacion_id',
  as: 'ticket'
});
Ticket.belongsTo(Cotizacion, {
  foreignKey: 'cotizacion_id',
  as: 'cotizacion'
});

// Relaciones Ticket <-> Cliente
Cliente.hasMany(Ticket, {
  foreignKey: 'cliente_id',
  as: 'tickets'
});
Ticket.belongsTo(Cliente, {
  foreignKey: 'cliente_id',
  as: 'cliente'
});

// Relaciones Ticket <-> Departamento
Departamento.hasMany(Ticket, {
  foreignKey: 'departamento_id',
  as: 'tickets'
});
Ticket.belongsTo(Departamento, {
  foreignKey: 'departamento_id',
  as: 'departamento'
});

// Relaciones Ticket <-> Usuario (asignado)
Usuario.hasMany(Ticket, {
  foreignKey: 'usuario_asignado_id',
  as: 'tickets_asignados'
});
Ticket.belongsTo(Usuario, {
  foreignKey: 'usuario_asignado_id',
  as: 'usuario_asignado'
});

// Relaciones Ticket <-> Usuario (creador)
Usuario.hasMany(Ticket, {
  foreignKey: 'usuario_creador_id',
  as: 'tickets_creados'
});
Ticket.belongsTo(Usuario, {
  foreignKey: 'usuario_creador_id',
  as: 'usuario_creador'
});

// Relaciones TicketMensaje <-> Ticket
Ticket.hasMany(TicketMensaje, {
  foreignKey: 'ticket_id',
  as: 'mensajes'
});
TicketMensaje.belongsTo(Ticket, {
  foreignKey: 'ticket_id',
  as: 'ticket'
});

// Relaciones TicketMensaje <-> Usuario
Usuario.hasMany(TicketMensaje, {
  foreignKey: 'usuario_id',
  as: 'mensajes_ticket'
});
TicketMensaje.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

module.exports = db;
