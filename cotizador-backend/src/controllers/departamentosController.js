const db = require('../models');
const { Departamento } = db;

// @desc    Obtener todos los departamentos
// @route   GET /api/departamentos
// @access  Private
exports.getAll = async (req, res) => {
  try {
    const { activo } = req.query;

    const whereClause = {};
    if (activo !== undefined) {
      whereClause.activo = activo === 'true';
    }

    const departamentos = await Departamento.findAll({
      where: whereClause,
      order: [['nombre', 'ASC']]
    });

    res.json({
      success: true,
      count: departamentos.length,
      data: departamentos
    });
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener departamentos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Crear departamento
// @route   POST /api/departamentos
// @access  Private/Admin
exports.create = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del departamento es requerido'
      });
    }

    // Verificar si ya existe
    const existente = await Departamento.findOne({ where: { nombre } });
    if (existente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un departamento con ese nombre'
      });
    }

    const nuevoDepartamento = await Departamento.create({
      nombre,
      descripcion,
      activo: true
    });

    res.status(201).json({
      success: true,
      message: 'Departamento creado exitosamente',
      data: nuevoDepartamento
    });
  } catch (error) {
    console.error('Error al crear departamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear departamento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Actualizar departamento
// @route   PUT /api/departamentos/:id
// @access  Private/Admin
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

    const departamento = await Departamento.findByPk(id);

    if (!departamento) {
      return res.status(404).json({
        success: false,
        message: 'Departamento no encontrado'
      });
    }

    await departamento.update({
      nombre: nombre || departamento.nombre,
      descripcion: descripcion !== undefined ? descripcion : departamento.descripcion,
      activo: activo !== undefined ? activo : departamento.activo
    });

    res.json({
      success: true,
      message: 'Departamento actualizado exitosamente',
      data: departamento
    });
  } catch (error) {
    console.error('Error al actualizar departamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar departamento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Eliminar departamento
// @route   DELETE /api/departamentos/:id
// @access  Private/Admin
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const departamento = await Departamento.findByPk(id);

    if (!departamento) {
      return res.status(404).json({
        success: false,
        message: 'Departamento no encontrado'
      });
    }

    await departamento.destroy();

    res.json({
      success: true,
      message: 'Departamento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar departamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar departamento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
