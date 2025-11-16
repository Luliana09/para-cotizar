const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TicketMensaje = sequelize.define('TicketMensaje', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ticket_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tickets',
        key: 'id'
      }
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    tipo: {
      type: DataTypes.ENUM('comentario', 'actualizacion', 'transferencia', 'asignacion'),
      defaultValue: 'comentario',
      allowNull: false
    },
    // Para guardar cambios de estado, prioridad, etc.
    metadata: {
      type: DataTypes.TEXT, // JSON
      allowNull: true
    }
  }, {
    tableName: 'ticket_mensajes',
    timestamps: true
  });

  return TicketMensaje;
};
