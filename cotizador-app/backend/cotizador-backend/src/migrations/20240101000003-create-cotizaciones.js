'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cotizaciones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      numero_cotizacion: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      cliente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'clientes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      tipo_servicio: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      categoria: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      espesor: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      precio_por_ft2: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      con_luz: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      metodo_calculo: {
        type: Sequelize.ENUM('area', 'letra'),
        allowNull: false
      },
      alto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      ancho: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      unidad: {
        type: Sequelize.ENUM('ft', 'in', 'cm', 'm'),
        allowNull: false
      },
      cantidad: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      area_unitaria: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false
      },
      area_total: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false
      },
      precio_base: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      recargo_color: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      color_personalizado: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      itbms: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      aplicar_itbms: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      estado: {
        type: Sequelize.ENUM('borrador', 'enviada', 'aprobada', 'rechazada', 'vencida'),
        defaultValue: 'borrador',
        allowNull: false
      },
      fecha_envio: {
        type: Sequelize.DATE,
        allowNull: true
      },
      fecha_aprobacion: {
        type: Sequelize.DATE,
        allowNull: true
      },
      fecha_vencimiento: {
        type: Sequelize.DATE,
        allowNull: true
      },
      notas: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      datos_calculo_json: {
        type: Sequelize.JSON,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Índices para búsqueda y rendimiento
    await queryInterface.addIndex('cotizaciones', ['numero_cotizacion'], {
      name: 'idx_cotizaciones_numero',
      unique: true
    });

    await queryInterface.addIndex('cotizaciones', ['usuario_id'], {
      name: 'idx_cotizaciones_usuario'
    });

    await queryInterface.addIndex('cotizaciones', ['cliente_id'], {
      name: 'idx_cotizaciones_cliente'
    });

    await queryInterface.addIndex('cotizaciones', ['estado'], {
      name: 'idx_cotizaciones_estado'
    });

    await queryInterface.addIndex('cotizaciones', ['fecha_envio'], {
      name: 'idx_cotizaciones_fecha_envio'
    });

    await queryInterface.addIndex('cotizaciones', ['createdAt'], {
      name: 'idx_cotizaciones_created'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('cotizaciones');
  }
};
