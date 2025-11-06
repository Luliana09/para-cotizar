'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clientes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      ruc: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },
      cedula: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      celular: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      direccion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      notas: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
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

    // Índices para búsqueda
    await queryInterface.addIndex('clientes', ['nombre'], {
      name: 'idx_clientes_nombre'
    });

    await queryInterface.addIndex('clientes', ['ruc'], {
      name: 'idx_clientes_ruc',
      unique: true
    });

    await queryInterface.addIndex('clientes', ['cedula'], {
      name: 'idx_clientes_cedula',
      unique: true
    });

    await queryInterface.addIndex('clientes', ['email'], {
      name: 'idx_clientes_email'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('clientes');
  }
};
