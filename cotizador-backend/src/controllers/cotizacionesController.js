const db = require('../models');
const Cotizacion = db.Cotizacion;
const Cliente = db.Cliente;
const Usuario = db.Usuario;
const { Op } = require('sequelize');

// Generar número de cotización único (COT-YYYY-NNNN)
const generarNumeroCotizacion = async () => {
  const año = new Date().getFullYear();
  const prefijo = `COT-${año}-`;

  // Buscar la última cotización del año
  const ultimaCotizacion = await Cotizacion.findOne({
    where: {
      numero_cotizacion: {
        [Op.like]: `${prefijo}%`
      }
    },
    order: [['numero_cotizacion', 'DESC']]
  });

  let numeroSecuencial = 1;
  if (ultimaCotizacion) {
    const ultimoNumero = ultimaCotizacion.numero_cotizacion.split('-')[2];
    numeroSecuencial = parseInt(ultimoNumero) + 1;
  }

  // Formato: COT-2024-0001
  return `${prefijo}${String(numeroSecuencial).padStart(4, '0')}`;
};

// @desc    Obtener todas las cotizaciones
// @route   GET /api/cotizaciones
// @access  Private
exports.getCotizaciones = async (req, res) => {
  try {
    const { estado, cliente_id, fecha_desde, fecha_hasta, search } = req.query;

    // Construir filtros
    const where = {};

    if (estado) {
      where.estado = estado;
    }

    if (cliente_id) {
      where.cliente_id = cliente_id;
    }

    if (fecha_desde || fecha_hasta) {
      where.createdAt = {};
      if (fecha_desde) {
        where.createdAt[Op.gte] = new Date(fecha_desde);
      }
      if (fecha_hasta) {
        where.createdAt[Op.lte] = new Date(fecha_hasta);
      }
    }

    if (search) {
      where[Op.or] = [
        { numero_cotizacion: { [Op.like]: `%${search}%` } },
        { tipo_servicio: { [Op.like]: `%${search}%` } },
        { categoria: { [Op.like]: `%${search}%` } }
      ];
    }

    const cotizaciones = await Cotizacion.findAll({
      where,
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'ruc', 'email', 'celular']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: cotizaciones.length,
      data: cotizaciones
    });
  } catch (error) {
    console.error('Error al obtener cotizaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cotizaciones',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obtener cotización por ID
// @route   GET /api/cotizaciones/:id
// @access  Private
exports.getCotizacion = async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findByPk(req.params.id, {
      include: [
        {
          model: Cliente,
          as: 'cliente'
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email']
        }
      ]
    });

    if (!cotizacion) {
      return res.status(404).json({
        success: false,
        message: 'Cotización no encontrada'
      });
    }

    res.json({
      success: true,
      data: cotizacion
    });
  } catch (error) {
    console.error('Error al obtener cotización:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cotización',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Crear nueva cotización
// @route   POST /api/cotizaciones
// @access  Private
exports.createCotizacion = async (req, res) => {
  try {
    const {
      cliente_id,
      tipo_servicio,
      categoria,
      espesor,
      precio_por_ft2,
      con_luz,
      metodo_calculo,
      alto,
      ancho,
      unidad,
      cantidad,
      area_unitaria,
      area_total,
      precio_base,
      recargo_color,
      color_personalizado,
      subtotal,
      itbms,
      aplicar_itbms,
      total,
      notas,
      datos_calculo_json
    } = req.body;

    // Validar datos requeridos
    if (!cliente_id || !tipo_servicio || !categoria) {
      return res.status(400).json({
        success: false,
        message: 'Cliente, tipo de servicio y categoría son requeridos'
      });
    }

    // Verificar que el cliente existe
    const cliente = await Cliente.findByPk(cliente_id);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Generar número de cotización
    const numero_cotizacion = await generarNumeroCotizacion();

    // Crear cotización
    const cotizacion = await Cotizacion.create({
      numero_cotizacion,
      usuario_id: req.usuario.id,
      cliente_id,
      tipo_servicio,
      categoria,
      espesor,
      precio_por_ft2,
      con_luz,
      metodo_calculo,
      alto,
      ancho,
      unidad,
      cantidad,
      area_unitaria,
      area_total,
      precio_base,
      recargo_color,
      color_personalizado,
      subtotal,
      itbms,
      aplicar_itbms,
      total,
      notas,
      datos_calculo_json
    });

    // Cargar datos completos
    const cotizacionCompleta = await Cotizacion.findByPk(cotizacion.id, {
      include: [
        {
          model: Cliente,
          as: 'cliente'
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Cotización creada exitosamente',
      data: cotizacionCompleta
    });
  } catch (error) {
    console.error('Error al crear cotización:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cotización',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Actualizar cotización
// @route   PUT /api/cotizaciones/:id
// @access  Private
exports.updateCotizacion = async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findByPk(req.params.id);

    if (!cotizacion) {
      return res.status(404).json({
        success: false,
        message: 'Cotización no encontrada'
      });
    }

    // Actualizar cotización
    await cotizacion.update(req.body);

    // Cargar datos completos
    const cotizacionActualizada = await Cotizacion.findByPk(cotizacion.id, {
      include: [
        {
          model: Cliente,
          as: 'cliente'
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Cotización actualizada exitosamente',
      data: cotizacionActualizada
    });
  } catch (error) {
    console.error('Error al actualizar cotización:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cotización',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Cambiar estado de cotización
// @route   PATCH /api/cotizaciones/:id/estado
// @access  Private
exports.cambiarEstado = async (req, res) => {
  try {
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({
        success: false,
        message: 'El estado es requerido'
      });
    }

    const cotizacion = await Cotizacion.findByPk(req.params.id);

    if (!cotizacion) {
      return res.status(404).json({
        success: false,
        message: 'Cotización no encontrada'
      });
    }

    const updateData = { estado };

    // Actualizar fechas según el estado
    if (estado === 'enviada' && !cotizacion.fecha_envio) {
      updateData.fecha_envio = new Date();
    }

    if (estado === 'aprobada') {
      updateData.fecha_aprobacion = new Date();
    }

    await cotizacion.update(updateData);

    res.json({
      success: true,
      message: 'Estado actualizado exitosamente',
      data: cotizacion
    });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Eliminar cotización
// @route   DELETE /api/cotizaciones/:id
// @access  Private/Admin
exports.deleteCotizacion = async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findByPk(req.params.id);

    if (!cotizacion) {
      return res.status(404).json({
        success: false,
        message: 'Cotización no encontrada'
      });
    }

    await cotizacion.destroy();

    res.json({
      success: true,
      message: 'Cotización eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar cotización:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cotización',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obtener estadísticas de cotizaciones
// @route   GET /api/cotizaciones/stats/resumen
// @access  Private
exports.getEstadisticas = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;

    const where = {};
    if (fecha_desde || fecha_hasta) {
      where.createdAt = {};
      if (fecha_desde) {
        where.createdAt[Op.gte] = new Date(fecha_desde);
      }
      if (fecha_hasta) {
        where.createdAt[Op.lte] = new Date(fecha_hasta);
      }
    }

    // Totales por estado
    const totalesPorEstado = await Cotizacion.findAll({
      where,
      attributes: [
        'estado',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'cantidad'],
        [db.sequelize.fn('SUM', db.sequelize.col('total')), 'monto_total']
      ],
      group: ['estado']
    });

    // Total general
    const totalGeneral = await Cotizacion.findAll({
      where,
      attributes: [
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'total_cotizaciones'],
        [db.sequelize.fn('SUM', db.sequelize.col('total')), 'monto_total']
      ]
    });

    res.json({
      success: true,
      data: {
        por_estado: totalesPorEstado,
        totales: totalGeneral[0]
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Cambiar estado de cotización
// @route   PATCH /api/cotizaciones/:id/estado
// @access  Private (solo admin puede aprobar/rechazar)
exports.cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar estado
    const estadosValidos = ['borrador', 'enviada', 'aprobada', 'rechazada', 'vencida'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}`
      });
    }

    // Solo admin puede aprobar o rechazar
    if ((estado === 'aprobada' || estado === 'rechazada') && req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los administradores pueden aprobar o rechazar cotizaciones'
      });
    }

    const cotizacion = await Cotizacion.findByPk(id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email', 'rol'] }
      ]
    });

    if (!cotizacion) {
      return res.status(404).json({
        success: false,
        message: 'Cotización no encontrada'
      });
    }

    // Actualizar estado
    cotizacion.estado = estado;
    await cotizacion.save();

    res.json({
      success: true,
      message: `Cotización ${estado} exitosamente`,
      data: cotizacion
    });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado de la cotización',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
