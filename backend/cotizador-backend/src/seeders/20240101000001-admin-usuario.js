'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hashear password del admin
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('usuarios', [
      {
        nombre: 'Administrador',
        email: 'admin@cotizador.com',
        password: hashedPassword,
        rol: 'admin',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    console.log('✅ Usuario administrador creado:');
    console.log('   Email: admin@cotizador.com');
    console.log('   Password: admin123');
    console.log('   ⚠️  CAMBIA ESTA CONTRASEÑA EN PRODUCCIÓN');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', {
      email: 'admin@cotizador.com'
    }, {});
  }
};
