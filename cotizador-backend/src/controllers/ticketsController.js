const db = require('../models');
const { Ticket, Cliente, Departamento, Usuario, Cotizacion, TicketMensaje } = db;
const { Op } = require('sequelize');

// Generar número de ticket único
const generarNumeroTicket = async () => {
  const año = new Date().getFullYear();

  // Buscar el último ticket del año actual (formato: 000001-2025)
  const ultimoTicket = await Ticket.findOne({
    where: {
      numero_ticket: {
        [Op.like]: `%-${año}`
      }
    },
    order: [['numero_ticket', 'DESC']]
  });

  let nuevoNumero = 1;
  if (ultimoTicket) {
    const ultimoNumero = parseInt(ultimoTicket.numero_ticket.split('-')[0]);
    nuevoNumero = ultimoNumero + 1;
  }

  return `${nuevoNumero.toString().padStart(6, '0')}-${año}`;
};

// @desc    Obtener todos los tickets
// @route   GET /api/tickets
// @access  Private
exports.getAll = async (req, res) => {
  try {
    const { estado, prioridad, departamento_id, usuario_asignado_id } = req.query;

    const whereClause = {};
    if (estado) whereClause.estado = estado;
    if (prioridad) whereClause.prioridad = prioridad;
    if (departamento_id) whereClause.departamento_id = departamento_id;
    if (usuario_asignado_id) whereClause.usuario_asignado_id = usuario_asignado_id;

    const tickets = await Ticket.findAll({
      where: whereClause,
      include: [
        {
          model: Cliente,
          as: 'cliente',
          attributes: ['id', 'nombre', 'email', 'celular', 'ruc']
        },
        {
          model: Departamento,
          as: 'departamento',
          attributes: ['id', 'nombre']
        },
        {
          model: Usuario,
          as: 'usuario_asignado',
          attributes: ['id', 'nombre', 'email']
        },
        {
          model: Usuario,
          as: 'usuario_creador',
          attributes: ['id', 'nombre', 'email']
        },
        {
          model: Cotizacion,
          as: 'cotizacion',
          attributes: ['id', 'numero_cotizacion', 'total']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tickets',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obtener ticket por ID
// @route   GET /api/tickets/:id
// @access  Private
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id, {
      include: [
        {
          model: Cliente,
          as: 'cliente'
        },
        {
          model: Departamento,
          as: 'departamento'
        },
        {
          model: Usuario,
          as: 'usuario_asignado',
          attributes: ['id', 'nombre', 'email']
        },
        {
          model: Usuario,
          as: 'usuario_creador',
          attributes: ['id', 'nombre', 'email']
        },
        {
          model: Cotizacion,
          as: 'cotizacion'
        },
        {
          model: TicketMensaje,
          as: 'mensajes',
          include: [{
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'email']
          }],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error al obtener ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Crear ticket desde cotización aprobada
// @route   POST /api/tickets
// @access  Private
exports.create = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const {
      cotizacion_id,
      cliente_id,
      departamento_id,
      usuario_asignado_id,
      trabajo,
      prioridad,
      fecha_entrega,
      fecha_vencimiento,
      notas
    } = req.body;

    // Validar datos requeridos
    if (!cliente_id || !departamento_id || !trabajo) {
      return res.status(400).json({
        success: false,
        message: 'Cliente, departamento y descripción del trabajo son requeridos'
      });
    }

    // Si viene de una cotización, validar que exista y esté aprobada
    if (cotizacion_id) {
      const cotizacion = await Cotizacion.findByPk(cotizacion_id);

      if (!cotizacion) {
        return res.status(404).json({
          success: false,
          message: 'Cotización no encontrada'
        });
      }

      if (cotizacion.estado !== 'aprobada') {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden crear tickets de cotizaciones aprobadas'
        });
      }

      // Verificar que no tenga ticket ya creado
      const ticketExistente = await Ticket.findOne({ where: { cotizacion_id } });
      if (ticketExistente) {
        return res.status(400).json({
          success: false,
          message: 'Esta cotización ya tiene un ticket asociado'
        });
      }
    }

    // Generar número de ticket
    const numero_ticket = await generarNumeroTicket();

    // Obtener datos de cotización si existe
    let datos_cotizacion_json = null;
    if (cotizacion_id) {
      const cotizacion = await Cotizacion.findByPk(cotizacion_id);
      datos_cotizacion_json = JSON.stringify({
        numero_cotizacion: cotizacion.numero_cotizacion,
        tipo_servicio: cotizacion.tipo_servicio,
        categoria: cotizacion.categoria,
        total: cotizacion.total,
        especificaciones: {
          alto: cotizacion.alto,
          ancho: cotizacion.ancho,
          unidad: cotizacion.unidad,
          cantidad: cotizacion.cantidad,
          espesor: cotizacion.espesor
        }
      });
    }

    // Crear ticket
    const nuevoTicket = await Ticket.create({
      numero_ticket,
      cotizacion_id,
      cliente_id,
      departamento_id,
      usuario_asignado_id,
      usuario_creador_id: req.usuario.id,
      trabajo,
      prioridad: prioridad || 'normal',
      estado: 'abierto',
      fecha_entrega,
      fecha_vencimiento,
      notas,
      datos_cotizacion_json
    }, { transaction });

    // Si viene de cotización, actualizar estado a 'en_produccion'
    if (cotizacion_id) {
      await Cotizacion.update(
        { estado: 'en_produccion' },
        { where: { id: cotizacion_id }, transaction }
      );
    }

    // Crear mensaje inicial
    await TicketMensaje.create({
      ticket_id: nuevoTicket.id,
      usuario_id: req.usuario.id,
      mensaje: `Ticket creado${cotizacion_id ? ' desde cotización #' + numero_ticket : ''}`,
      tipo: 'actualizacion'
    }, { transaction });

    await transaction.commit();

    // Obtener ticket completo con relaciones
    const ticketCompleto = await Ticket.findByPk(nuevoTicket.id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Departamento, as: 'departamento' },
        { model: Usuario, as: 'usuario_asignado', attributes: ['id', 'nombre', 'email'] },
        { model: Usuario, as: 'usuario_creador', attributes: ['id', 'nombre', 'email'] },
        { model: Cotizacion, as: 'cotizacion' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Ticket creado exitosamente',
      data: ticketCompleto
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Actualizar ticket
// @route   PUT /api/tickets/:id
// @access  Private
exports.update = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      departamento_id,
      usuario_asignado_id,
      trabajo,
      prioridad,
      estado,
      fecha_entrega,
      fecha_vencimiento,
      notas
    } = req.body;

    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }

    // Guardar cambios para el mensaje
    const cambios = [];

    if (departamento_id && departamento_id !== ticket.departamento_id) {
      cambios.push('departamento');
    }
    if (usuario_asignado_id !== undefined && usuario_asignado_id !== ticket.usuario_asignado_id) {
      cambios.push('asignación');
    }
    if (prioridad && prioridad !== ticket.prioridad) {
      cambios.push(`prioridad: ${ticket.prioridad} → ${prioridad}`);
    }
    if (estado && estado !== ticket.estado) {
      cambios.push(`estado: ${ticket.estado} → ${estado}`);
    }

    // Actualizar ticket
    await ticket.update({
      departamento_id: departamento_id || ticket.departamento_id,
      usuario_asignado_id,
      trabajo: trabajo || ticket.trabajo,
      prioridad: prioridad || ticket.prioridad,
      estado: estado || ticket.estado,
      fecha_entrega: fecha_entrega || ticket.fecha_entrega,
      fecha_vencimiento: fecha_vencimiento || ticket.fecha_vencimiento,
      notas: notas !== undefined ? notas : ticket.notas
    }, { transaction });

    // Crear mensaje de actualización si hubo cambios
    if (cambios.length > 0) {
      await TicketMensaje.create({
        ticket_id: id,
        usuario_id: req.usuario.id,
        mensaje: `Ticket actualizado: ${cambios.join(', ')}`,
        tipo: 'actualizacion',
        metadata: JSON.stringify({ cambios })
      }, { transaction });
    }

    await transaction.commit();

    // Obtener ticket actualizado
    const ticketActualizado = await Ticket.findByPk(id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Departamento, as: 'departamento' },
        { model: Usuario, as: 'usuario_asignado', attributes: ['id', 'nombre', 'email'] },
        { model: Usuario, as: 'usuario_creador', attributes: ['id', 'nombre', 'email'] },
        { model: Cotizacion, as: 'cotizacion' }
      ]
    });

    res.json({
      success: true,
      message: 'Ticket actualizado exitosamente',
      data: ticketActualizado
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Cambiar estado de ticket
// @route   PATCH /api/tickets/:id/estado
// @access  Private
exports.cambiarEstado = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({
        success: false,
        message: 'El estado es requerido'
      });
    }

    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }

    const estadoAnterior = ticket.estado;
    await ticket.update({ estado }, { transaction });

    // Crear mensaje de cambio de estado
    await TicketMensaje.create({
      ticket_id: id,
      usuario_id: req.usuario.id,
      mensaje: `Estado cambiado de "${estadoAnterior}" a "${estado}"`,
      tipo: 'actualizacion'
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Estado actualizado exitosamente',
      data: ticket
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al cambiar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Agregar mensaje al ticket
// @route   POST /api/tickets/:id/mensajes
// @access  Private
exports.agregarMensaje = async (req, res) => {
  try {
    const { id } = req.params;
    const { mensaje } = req.body;

    if (!mensaje) {
      return res.status(400).json({
        success: false,
        message: 'El mensaje es requerido'
      });
    }

    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }

    const nuevoMensaje = await TicketMensaje.create({
      ticket_id: id,
      usuario_id: req.usuario.id,
      mensaje,
      tipo: 'comentario'
    });

    const mensajeCompleto = await TicketMensaje.findByPk(nuevoMensaje.id, {
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nombre', 'email']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Mensaje agregado exitosamente',
      data: mensajeCompleto
    });
  } catch (error) {
    console.error('Error al agregar mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar mensaje',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Eliminar ticket
// @route   DELETE /api/tickets/:id
// @access  Private/Admin
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }

    await ticket.destroy();

    res.json({
      success: true,
      message: 'Ticket eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obtener estadísticas de tickets
// @route   GET /api/tickets/stats/resumen
// @access  Private
exports.getEstadisticas = async (req, res) => {
  try {
    const { departamento_id } = req.query;

    const whereClause = {};
    if (departamento_id) whereClause.departamento_id = departamento_id;

    const [
      total,
      abiertos,
      enProceso,
      resueltos,
      cerrados,
      porProcesar,
      urgentes
    ] = await Promise.all([
      Ticket.count({ where: whereClause }),
      Ticket.count({ where: { ...whereClause, estado: 'abierto' } }),
      Ticket.count({ where: { ...whereClause, estado: 'en_proceso' } }),
      Ticket.count({ where: { ...whereClause, estado: 'resuelto' } }),
      Ticket.count({ where: { ...whereClause, estado: 'cerrado' } }),
      Ticket.count({ where: { ...whereClause, estado: 'por_procesar' } }),
      Ticket.count({ where: { ...whereClause, prioridad: 'emergency' } })
    ]);

    res.json({
      success: true,
      data: {
        total,
        abiertos,
        enProceso,
        resueltos,
        cerrados,
        porProcesar,
        urgentes
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
