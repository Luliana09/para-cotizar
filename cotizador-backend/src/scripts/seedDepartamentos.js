const db = require('../models');
const { Departamento } = db;

const departamentosIniciales = [
  { nombre: 'DISEÑO 1', descripcion: 'Departamento de diseño gráfico y arte - Equipo 1' },
  { nombre: 'DISEÑO 2', descripcion: 'Departamento de diseño gráfico y arte - Equipo 2' },
  { nombre: 'IMPRESIÓN 1', descripcion: 'Departamento de impresión y producción - Equipo 1' },
  { nombre: 'IMPRESIÓN 2', descripcion: 'Departamento de impresión y producción - Equipo 2' },
  { nombre: 'VENTAS', descripcion: 'Departamento de ventas y atención al cliente' }
];

async function seedDepartamentos() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await db.sequelize.authenticate();
    console.log('✅ Conexión establecida');

    console.log('🔄 Sincronizando modelos...');
    await db.sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados');

    console.log('🔄 Insertando departamentos...');

    for (const dept of departamentosIniciales) {
      const existe = await Departamento.findOne({ where: { nombre: dept.nombre } });

      if (!existe) {
        await Departamento.create({
          ...dept,
          activo: true
        });
        console.log(`✅ Departamento "${dept.nombre}" creado`);
      } else {
        console.log(`⚠️  Departamento "${dept.nombre}" ya existe`);
      }
    }

    console.log('✅ Proceso completado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedDepartamentos();
