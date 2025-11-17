import React, { useState, useEffect } from 'react';
import { ticketsService } from '../services/apiService';
import './MisTickets.css';

const MisTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [alerta, setAlerta] = useState({ tipo: '', mensaje: '' });

  useEffect(() => {
    cargarTickets();
  }, []);

  const cargarTickets = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando tickets...');

      const response = await ticketsService.getAll();
      console.log('📦 Tickets recibidos:', response);

      if (response.success) {
        setTickets(response.data);
        console.log(`✅ ${response.data.length} tickets cargados`);
      }
    } catch (error) {
      console.error('❌ Error al cargar tickets:', error);
      mostrarAlerta('error', 'Error al cargar tickets');
    } finally {
      setLoading(false);
    }
  };

  const mostrarAlerta = (tipo, mensaje, duracion = 5000) => {
    setAlerta({ tipo, mensaje });
    if (duracion > 0) {
      setTimeout(() => setAlerta({ tipo: '', mensaje: '' }), duracion);
    }
  };

  const handleCambiarEstado = async (ticketId, nuevoEstado) => {
    try {
      const response = await ticketsService.cambiarEstado(ticketId, nuevoEstado);

      if (response.success) {
        mostrarAlerta('success', 'Estado actualizado exitosamente', 3000);
        cargarTickets();
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      mostrarAlerta('error', 'Error al cambiar el estado');
    }
  };

  const getPrioridadColor = (prioridad) => {
    const colores = {
      low: '#95a5a6',
      normal: '#3498db',
      high: '#f39c12',
      emergency: '#e74c3c'
    };
    return colores[prioridad] || '#95a5a6';
  };

  const getPrioridadTexto = (prioridad) => {
    const textos = {
      low: 'Baja',
      normal: 'Normal',
      high: 'Alta',
      emergency: 'Urgente'
    };
    return textos[prioridad] || prioridad;
  };

  const getEstadoColor = (estado) => {
    const colores = {
      abierto: '#3498db',
      en_proceso: '#f39c12',
      resuelto: '#2ecc71',
      cerrado: '#95a5a6',
      por_procesar: '#9b59b6',
      cancelado: '#e74c3c'
    };
    return colores[estado] || '#95a5a6';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      abierto: 'Abierto',
      en_proceso: 'En Proceso',
      resuelto: 'Resuelto',
      cerrado: 'Cerrado',
      por_procesar: 'Por Procesar',
      cancelado: 'Cancelado'
    };
    return textos[estado] || estado;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-PA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ticketsFiltrados = filtroEstado === 'todos'
    ? tickets
    : tickets.filter(t => t.estado === filtroEstado);

  if (loading) {
    return (
      <div className="mis-tickets-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mis-tickets-container">
      <div className="tickets-header">
        <div className="header-top">
          <h2>🎫 Mis Tickets</h2>
          <button
            className="btn-nuevo-ticket"
            onClick={() => window.location.href = '/crear-ticket'}
          >
            + Crear Nuevo Ticket
          </button>
        </div>
        <div className="filtros">
          <button
            className={`filtro-btn ${filtroEstado === 'todos' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('todos')}
          >
            Todos ({tickets.length})
          </button>
          <button
            className={`filtro-btn ${filtroEstado === 'abierto' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('abierto')}
          >
            Abiertos ({tickets.filter(t => t.estado === 'abierto').length})
          </button>
          <button
            className={`filtro-btn ${filtroEstado === 'en_proceso' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('en_proceso')}
          >
            En Proceso ({tickets.filter(t => t.estado === 'en_proceso').length})
          </button>
          <button
            className={`filtro-btn ${filtroEstado === 'resuelto' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('resuelto')}
          >
            Resueltos ({tickets.filter(t => t.estado === 'resuelto').length})
          </button>
        </div>
      </div>

      {alerta.mensaje && (
        <div className={`alerta alerta-${alerta.tipo}`}>
          {alerta.mensaje}
        </div>
      )}

      {ticketsFiltrados.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎫</div>
          <h3>No hay tickets {filtroEstado !== 'todos' ? getEstadoTexto(filtroEstado).toLowerCase() : ''}</h3>
          <p>Los tickets creados aparecerán aquí</p>
        </div>
      ) : (
        <div className="tickets-lista">
          {ticketsFiltrados.map(ticket => (
            <div key={ticket.id} className="ticket-card">
              <div className="ticket-card-header">
                <div className="ticket-numero">
                  {ticket.numero_ticket}
                </div>
                <div className="ticket-badges">
                  <span
                    className="badge badge-prioridad"
                    style={{ backgroundColor: getPrioridadColor(ticket.prioridad) }}
                  >
                    {getPrioridadTexto(ticket.prioridad)}
                  </span>
                  <span
                    className="badge badge-estado"
                    style={{ backgroundColor: getEstadoColor(ticket.estado) }}
                  >
                    {getEstadoTexto(ticket.estado)}
                  </span>
                </div>
              </div>

              <div className="ticket-card-body">
                <div className="info-row">
                  <span className="label">Cliente:</span>
                  <span className="value">{ticket.cliente?.nombre || 'N/A'}</span>
                </div>

                <div className="info-row">
                  <span className="label">Departamento:</span>
                  <span className="value">{ticket.departamento?.nombre || 'N/A'}</span>
                </div>

                {ticket.usuario_asignado && (
                  <div className="info-row">
                    <span className="label">Asignado a:</span>
                    <span className="value">{ticket.usuario_asignado.nombre}</span>
                  </div>
                )}

                <div className="info-row">
                  <span className="label">Creado:</span>
                  <span className="value fecha">{formatearFecha(ticket.createdAt)}</span>
                </div>

                {ticket.fecha_entrega && (
                  <div className="info-row">
                    <span className="label">Fecha Entrega:</span>
                    <span className="value fecha">{formatearFecha(ticket.fecha_entrega)}</span>
                  </div>
                )}

                <div className="trabajo-preview">
                  <span className="label">Trabajo:</span>
                  <p className="trabajo-texto">{ticket.trabajo.substring(0, 150)}...</p>
                </div>
              </div>

              <div className="ticket-card-actions">
                <select
                  value={ticket.estado}
                  onChange={(e) => handleCambiarEstado(ticket.id, e.target.value)}
                  className="estado-selector"
                >
                  <option value="abierto">Abierto</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="resuelto">Resuelto</option>
                  <option value="cerrado">Cerrado</option>
                  <option value="por_procesar">Por Procesar</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisTickets;
