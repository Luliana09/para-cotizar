import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ticketsService, departamentosService, usuariosService } from '../services/apiService';
import './FormularioTicket.css';

const FormularioTicket = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cotizacion = location.state?.cotizacion;

  const [formData, setFormData] = useState({
    cotizacion_id: cotizacion?.id || null,
    cliente_id: cotizacion?.cliente_id || '',
    departamento_id: '',
    usuario_asignado_id: '',
    trabajo: '',
    prioridad: 'normal',
    fecha_entrega: '',
    fecha_vencimiento: '',
    notas: ''
  });

  const [departamentos, setDepartamentos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alerta, setAlerta] = useState({ tipo: '', mensaje: '' });

  useEffect(() => {
    cargarDatos();
    if (cotizacion) {
      generarDescripcionTrabajo();
    }
  }, []);

  const cargarDatos = async () => {
    try {
      const [deptResponse, userResponse] = await Promise.all([
        departamentosService.getAll(true),
        usuariosService.getAll()
      ]);

      if (deptResponse.success) {
        setDepartamentos(deptResponse.data);
      }

      if (userResponse.success) {
        setUsuarios(userResponse.data);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      mostrarAlerta('error', 'Error al cargar departamentos y usuarios');
    }
  };

  const generarDescripcionTrabajo = () => {
    if (!cotizacion) return;

    const descripcion = `Orden de Trabajo - Cotización ${cotizacion.numero_cotizacion}

Cliente: ${cotizacion.cliente?.nombre || 'N/A'}
Servicio: ${cotizacion.tipo_servicio}
Categoría: ${cotizacion.categoria}
Dimensiones: ${cotizacion.alto} x ${cotizacion.ancho} ${cotizacion.unidad}
Cantidad: ${cotizacion.cantidad}
${cotizacion.espesor ? `Espesor: ${cotizacion.espesor}` : ''}
${cotizacion.con_luz ? 'CON LUZ: Sí' : ''}
${cotizacion.color_personalizado ? 'Color personalizado' : ''}

Total: $${cotizacion.total}

${cotizacion.notas ? `Notas de la cotización:\n${cotizacion.notas}` : ''}`;

    setFormData(prev => ({ ...prev, trabajo: descripcion }));
  };

  const mostrarAlerta = (tipo, mensaje, duracion = 5000) => {
    setAlerta({ tipo, mensaje });
    if (duracion > 0) {
      setTimeout(() => setAlerta({ tipo: '', mensaje: '' }), duracion);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.departamento_id) {
      mostrarAlerta('error', 'Debe seleccionar un departamento');
      return;
    }

    if (!formData.trabajo.trim()) {
      mostrarAlerta('error', 'Debe describir el trabajo a realizar');
      return;
    }

    try {
      setLoading(true);

      const ticketData = {
        ...formData,
        usuario_asignado_id: formData.usuario_asignado_id || null,
        cliente_id: cotizacion?.cliente_id || formData.cliente_id
      };

      console.log('📤 Enviando ticket:', ticketData);

      const response = await ticketsService.create(ticketData);

      if (response.success) {
        mostrarAlerta('success', `Ticket ${response.data.numero_ticket} creado exitosamente`, 3000);
        setTimeout(() => {
          navigate('/mis-tickets');
        }, 3000);
      }
    } catch (error) {
      console.error('Error al crear ticket:', error);
      mostrarAlerta('error', error.response?.data?.message || 'Error al crear el ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    navigate('/cotizaciones-aprobadas');
  };

  return (
    <div className="formulario-ticket-container">
      <div className="formulario-header">
        <h2>
          {cotizacion ? '🎫 Generar Orden de Trabajo' : '🎫 Crear Ticket'}
        </h2>
        {cotizacion && (
          <div className="cotizacion-badge">
            Desde cotización: {cotizacion.numero_cotizacion}
          </div>
        )}
      </div>

      {alerta.mensaje && (
        <div className={`alerta alerta-${alerta.tipo}`}>
          {alerta.mensaje}
        </div>
      )}

      <form onSubmit={handleSubmit} className="ticket-form">
        {cotizacion && (
          <div className="info-cotizacion">
            <h3>Información de la Cotización</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Cliente:</span>
                <span className="value">{cotizacion.cliente?.nombre}</span>
              </div>
              <div className="info-item">
                <span className="label">Total:</span>
                <span className="value total">${cotizacion.total}</span>
              </div>
            </div>
          </div>
        )}

        <div className="form-section">
          <h3>Asignación</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="departamento_id">
                Departamento <span className="required">*</span>
              </label>
              <select
                id="departamento_id"
                name="departamento_id"
                value={formData.departamento_id}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="">Seleccionar departamento...</option>
                {departamentos.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="usuario_asignado_id">
                Asignar a (opcional)
              </label>
              <select
                id="usuario_asignado_id"
                name="usuario_asignado_id"
                value={formData.usuario_asignado_id}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Sin asignar</option>
                {usuarios.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.nombre} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prioridad">Prioridad</label>
              <select
                id="prioridad"
                name="prioridad"
                value={formData.prioridad}
                onChange={handleChange}
                className="form-control"
              >
                <option value="low">Baja</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="emergency">Urgente</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Detalles del Trabajo</h3>

          <div className="form-group">
            <label htmlFor="trabajo">
              Descripción del Trabajo <span className="required">*</span>
            </label>
            <textarea
              id="trabajo"
              name="trabajo"
              value={formData.trabajo}
              onChange={handleChange}
              required
              rows="10"
              className="form-control"
              placeholder="Describa el trabajo a realizar..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fecha_entrega">Fecha de Entrega</label>
              <input
                type="datetime-local"
                id="fecha_entrega"
                name="fecha_entrega"
                value={formData.fecha_entrega}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="fecha_vencimiento">Fecha de Vencimiento</label>
              <input
                type="datetime-local"
                id="fecha_vencimiento"
                name="fecha_vencimiento"
                value={formData.fecha_vencimiento}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notas">Notas Adicionales</label>
            <textarea
              id="notas"
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows="4"
              className="form-control"
              placeholder="Notas u observaciones adicionales..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancelar}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioTicket;
