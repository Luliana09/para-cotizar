module.exports = (sequelize, DataTypes) => {
  const Cotizacion = sequelize.define('Cotizacion', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    numero_cotizacion: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clientes',
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

    // Datos del servicio
    tipo_servicio: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    categoria: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    espesor: {
      type: DataTypes.STRING(50),
      allowNull: true
    },

    // Datos de cálculo
    metodo_calculo: {
      type: DataTypes.ENUM('area', 'letra'),
      allowNull: false,
      defaultValue: 'area'
    },
    alto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    ancho: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    unidad: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },

    // Resultados de cálculo
    area_unitaria: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    area_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    precio_por_ft2: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    precio_base: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    recargo_color: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    itbms: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },

    // Opciones
    color_personalizado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    aplicar_itbms: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    con_luz: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    // Estado y seguimiento
    estado: {
      type: DataTypes.ENUM('borrador', 'enviada', 'aprobada', 'rechazada', 'vencida'),
      defaultValue: 'borrador',
      allowNull: false
    },
    fecha_envio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_aprobacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_vencimiento: {
      type: DataTypes.DATE,
      allowNull: true
    },

    // Notas y observaciones
    notas: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    condicionales_aplicadas: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    // JSON con datos completos del servicio (backup)
    datos_servicio_json: {
      type: DataTypes.JSON,
      allowNull: true
    },
    // JSON con datos completos del cálculo
    datos_calculo_json: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'cotizaciones',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        unique: true,
        fields: ['numero_cotizacion']
      },
      {
        fields: ['cliente_id']
      },
      {
        fields: ['usuario_id']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['fecha_envio']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  return Cotizacion;
};
