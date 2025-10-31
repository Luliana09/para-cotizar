const db = require('../models');
const Cliente = db.Cliente;
const { Op } = require('sequelize');

// @desc    Obtener todos los clientes
// @route   GET /api/clientes
// @access  Private
exports.getClientes = async (req, res) => {
  try {
    const { search, activo } = req.query;

    // Construir filtros
    const where = {};

    if (search) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { ruc: { [Op.like]: `%${search}%` } },
        { cedula: { [Op.like]: `%${search}%` } }
      ];
    }

    if (activo !== undefined) {
      where.activo = activo === 'true';
    }

    const clientes = await Cliente.findAll({
      where,
      order: [['nombre', 'ASC']]
    });

    res.json({
      success: true,
      count: clientes.length,
      data: clientes
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clientes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obtener cliente por ID
// @route   GET /api/clientes/:id
// @access  Private
exports.getCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id, {
      include: [
        {
          model: db.Cotizacion,
          as: 'cotizaciones',
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      data: cliente
    });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Crear nuevo cliente
// @route   POST /api/clientes
// @access  Private
exports.createCliente = async (req, res) => {
  try {
    const { nombre, ruc, cedula, email, telefono, celular, direccion, notas } = req.body;

    // Validar datos requeridos
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre es requerido'
      });
    }

    // Verificar duplicados
    if (ruc) {
      const clienteExistente = await Cliente.findOne({ where: { ruc } });
      if (clienteExistente) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un cliente con este RUC'
        });
      }
    }

    if (cedula) {
      const clienteExistente = await Cliente.findOne({ where: { cedula } });
      if (clienteExistente) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un cliente con esta cédula'
        });
      }
    }

    // Crear cliente
    const cliente = await Cliente.create({
      nombre,
      ruc,
      cedula,
      email,
      telefono,
      celular,
      direccion,
      notas
    });

    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: cliente
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Actualizar cliente
// @route   PUT /api/clientes/:id
// @access  Private
exports.updateCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    const { nombre, ruc, cedula, email, telefono, celular, direccion, notas, activo } = req.body;

    // Verificar duplicados (excluyendo el actual)
    if (ruc && ruc !== cliente.ruc) {
      const clienteExistente = await Cliente.findOne({ where: { ruc } });
      if (clienteExistente) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un cliente con este RUC'
        });
      }
    }

    if (cedula && cedula !== cliente.cedula) {
      const clienteExistente = await Cliente.findOne({ where: { cedula } });
      if (clienteExistente) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un cliente con esta cédula'
        });
      }
    }

    // Actualizar cliente
    await cliente.update({
      nombre: nombre || cliente.nombre,
      ruc: ruc !== undefined ? ruc : cliente.ruc,
      cedula: cedula !== undefined ? cedula : cliente.cedula,
      email: email !== undefined ? email : cliente.email,
      telefono: telefono !== undefined ? telefono : cliente.telefono,
      celular: celular !== undefined ? celular : cliente.celular,
      direccion: direccion !== undefined ? direccion : cliente.direccion,
      notas: notas !== undefined ? notas : cliente.notas,
      activo: activo !== undefined ? activo : cliente.activo
    });

    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: cliente
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Eliminar cliente (soft delete)
// @route   DELETE /api/clientes/:id
// @access  Private/Admin
exports.deleteCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByPk(req.params.id);

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Soft delete - marcar como inactivo
    await cliente.update({ activo: false });

    res.json({
      success: true,
      message: 'Cliente desactivado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cliente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
