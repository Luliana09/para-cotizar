module.exports = (sequelize, DataTypes) => {
  const Configuracion = sequelize.define('Configuracion', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    clave: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    valor: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tipo: {
      type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
      defaultValue: 'string'
    }
  }, {
    tableName: 'configuraciones',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        unique: true,
        fields: ['clave']
      }
    ]
  });

  return Configuracion;
};
