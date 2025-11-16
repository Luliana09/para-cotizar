const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Ticket = sequelize.define('Ticket', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    numero_ticket: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    cotizacion_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Puede haber tickets sin cotización
      references: {
        model: 'cotizaciones',
        key: 'id'
      }
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clientes',
        key: 'id'
      }
    },
    departamento_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'departamentos',
        key: 'id'
      }
    },
    usuario_asignado_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    usuario_creador_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    trabajo: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    prioridad: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'emergency'),
      defaultValue: 'normal',
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('abierto', 'en_proceso', 'resuelto', 'cerrado', 'por_procesar', 'cancelado'),
      defaultValue: 'abierto',
      allowNull: false
    },
    fecha_entrega: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_vencimiento: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Datos de la cotización en JSON para referencia rápida
    datos_cotizacion_json: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'tickets',
    timestamps: true
  });

  return Ticket;
};
