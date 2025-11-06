import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { cotizacionesService } from '../services/apiService';
import './PanelAprobaciones.css';

const PanelAprobaciones = () => {
  const { usuario } = useAuth();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('pendientes'); // pendientes, todas, aprobadas, rechazadas
  const [alerta, setAlerta] = useState({ tipo: '', mensaje: '' });
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    cargarCotizaciones();
  }, [filtro]);

  const cargarCotizaciones = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando cotizaciones...');

      const response = await cotizacionesService.getAll();
      console.log('📦 Respuesta del servidor:', response);

      if (response.success) {
        let cotizacionesFiltradas = response.data || [];
        console.log('✅ Cotizaciones recibidas:', cotizacionesFiltradas.length);

        // Filtrar según el estado seleccionado
        if (filtro === 'pendientes') {
          cotizacionesFiltradas = cotizacionesFiltradas.filter(
            c => c.estado === 'enviada' || c.estado === 'borrador'
          );
        } else if (filtro === 'aprobadas') {
          cotizacionesFiltradas = cotizacionesFiltradas.filter(c => c.estado === 'aprobada');
        } else if (filtro === 'rechazadas') {
          cotizacionesFiltradas = cotizacionesFiltradas.filter(c => c.estado === 'rechazada');
        }

        console.log(`📊 Cotizaciones filtradas (${filtro}):`, cotizacionesFiltradas.length);
        setCotizaciones(cotizacionesFiltradas);

        if (cotizacionesFiltradas.length === 0) {
          mostrarAlerta('info', `No hay cotizaciones ${filtro === 'pendientes' ? 'pendientes' : filtro}`, 3000);
        }
      } else {
        console.error('❌ Error en respuesta:', response.message);
        mostrarAlerta('error', response.message || 'Error al cargar las cotizaciones');
      }
    } catch (error) {
      console.error('❌ Error al cargar cotizaciones:', error);
      console.error('Detalles del error:', error.response?.data);
      mostrarAlerta('error', `Error al cargar las cotizaciones: ${error.response?.data?.message || error.message}`);
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

  const handleVerDetalle = (cotizacion) => {
    setCotizacionSeleccionada(cotizacion);
    setMostrarModal(true);
  };

  const handleCambiarEstado = async (cotizacionId, nuevoEstado) => {
    try {
      const response = await cotizacionesService.cambiarEstado(cotizacionId, nuevoEstado);

      if (response.success) {
        mostrarAlerta('success', `Cotización ${nuevoEstado} exitosamente`);
        setMostrarModal(false);
        cargarCotizaciones();
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      mostrarAlerta('error', 'Error al cambiar el estado de la cotización');
    }
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'USD'
    }).format(valor);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      'borrador': { label: 'Borrador', color: '#94a3b8', icon: '📝' },
      'enviada': { label: 'Pendiente', color: '#f59e0b', icon: '⏳' },
      'aprobada': { label: 'Aprobada', color: '#10b981', icon: '✅' },
      'rechazada': { label: 'Rechazada', color: '#ef4444', icon: '❌' },
      'vencida': { label: 'Vencida', color: '#64748b', icon: '⌛' }
    };
    const est = estados[estado] || estados['borrador'];
    return (
      <span className="estado-badge" style={{ backgroundColor: est.color }}>
        <span className="estado-icon">{est.icon}</span>
        {est.label}
      </span>
    );
  };

  const getPrioridadBadge = (diasTranscurridos) => {
    if (diasTranscurridos > 7) {
      return <span className="prioridad-badge urgente">🔴 Urgente</span>;
    } else if (diasTranscurridos > 3) {
      return <span className="prioridad-badge alta">🟡 Alta</span>;
    }
    return <span className="prioridad-badge normal">🟢 Normal</span>;
  };

  const calcularDiasTranscurridos = (fecha) => {
    const hoy = new Date();
    const fechaCotizacion = new Date(fecha);
    const diferencia = hoy - fechaCotizacion;
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  };

  if (usuario?.rol !== 'admin') {
    return (
      <div className="panel-aprobaciones">
        <div className="acceso-denegado">
          <div className="acceso-icon">🚫</div>
          <h2>Acceso Denegado</h2>
          <p>Solo los administradores pueden acceder al panel de aprobaciones.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-aprobaciones">
      {/* Header */}
      <div className="panel-header">
        <div className="header-content">
          <h1 className="panel-title">
            <span className="title-icon">✅</span>
            Panel de Aprobaciones
          </h1>
          <p className="panel-subtitle">
            Gestiona y aprueba las cotizaciones pendientes
          </p>
        </div>
        <button className="btn-refresh" onClick={cargarCotizaciones}>
          🔄 Actualizar
        </button>
      </div>

      {/* Alertas */}
      {alerta.mensaje && (
        <div className={`alert alert-${alerta.tipo}`}>
          {alerta.mensaje}
        </div>
      )}

      {/* Filtros */}
      <div className="filtros-container">
        <button
          className={`filtro-btn ${filtro === 'pendientes' ? 'active' : ''}`}
          onClick={() => setFiltro('pendientes')}
        >
          <span className="filtro-icon">⏳</span>
          Pendientes
          <span className="filtro-count">
            {cotizaciones.filter(c => c.estado === 'enviada' || c.estado === 'borrador').length}
          </span>
        </button>
        <button
          className={`filtro-btn ${filtro === 'aprobadas' ? 'active' : ''}`}
          onClick={() => setFiltro('aprobadas')}
        >
          <span className="filtro-icon">✅</span>
          Aprobadas
        </button>
        <button
          className={`filtro-btn ${filtro === 'rechazadas' ? 'active' : ''}`}
          onClick={() => setFiltro('rechazadas')}
        >
          <span className="filtro-icon">❌</span>
          Rechazadas
        </button>
        <button
          className={`filtro-btn ${filtro === 'todas' ? 'active' : ''}`}
          onClick={() => setFiltro('todas')}
        >
          <span className="filtro-icon">📋</span>
          Todas
        </button>
      </div>

      {/* Lista de Cotizaciones */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando cotizaciones...</p>
        </div>
      ) : cotizaciones.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No hay cotizaciones {filtro}</h3>
          <p>No se encontraron cotizaciones para mostrar</p>
        </div>
      ) : (
        <div className="cotizaciones-grid">
          {cotizaciones.map((cotizacion) => {
            const diasTranscurridos = calcularDiasTranscurridos(cotizacion.createdAt);

            return (
              <div key={cotizacion.id} className="cotizacion-card">
                <div className="card-header">
                  <div className="card-numero">
                    <span className="numero-icon">📄</span>
                    {cotizacion.numero_cotizacion}
                  </div>
                  {getEstadoBadge(cotizacion.estado)}
                </div>

                <div className="card-body">
                  {cotizacion.estado === 'enviada' && getPrioridadBadge(diasTranscurridos)}

                  <div className="card-info">
                    <span className="info-label">Cliente:</span>
                    <span className="info-value">{cotizacion.cliente?.nombre || cotizacion.Cliente?.nombre || 'N/A'}</span>
                  </div>

                  <div className="card-info">
                    <span className="info-label">Servicio:</span>
                    <span className="info-value">{cotizacion.tipo_servicio}</span>
                  </div>

                  <div className="card-info">
                    <span className="info-label">Total:</span>
                    <span className="info-value total">{formatearMoneda(cotizacion.total)}</span>
                  </div>

                  <div className="card-info">
                    <span className="info-label">Fecha:</span>
                    <span className="info-value">{formatearFecha(cotizacion.createdAt)}</span>
                  </div>

                  {cotizacion.estado === 'enviada' && (
                    <div className="card-info">
                      <span className="info-label">Días pendiente:</span>
                      <span className="info-value dias">{diasTranscurridos} días</span>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <button
                    className="btn-detalle"
                    onClick={() => handleVerDetalle(cotizacion)}
                  >
                    Ver Detalle
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalle */}
      {mostrarModal && cotizacionSeleccionada && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalle de Cotización</h2>
              <button className="btn-close" onClick={() => setMostrarModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="detalle-grupo">
                <h3>Información General</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">Número:</span>
                    <span className="detalle-valor">{cotizacionSeleccionada.numero_cotizacion}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Estado:</span>
                    {getEstadoBadge(cotizacionSeleccionada.estado)}
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Cliente:</span>
                    <span className="detalle-valor">{cotizacionSeleccionada.cliente?.nombre || cotizacionSeleccionada.Cliente?.nombre}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Fecha:</span>
                    <span className="detalle-valor">{formatearFecha(cotizacionSeleccionada.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="detalle-grupo">
                <h3>Detalles del Servicio</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">Tipo de Servicio:</span>
                    <span className="detalle-valor">{cotizacionSeleccionada.tipo_servicio}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Categoría:</span>
                    <span className="detalle-valor">{cotizacionSeleccionada.categoria}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Área Total:</span>
                    <span className="detalle-valor">{cotizacionSeleccionada.area_total} ft²</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Precio por ft²:</span>
                    <span className="detalle-valor">{formatearMoneda(cotizacionSeleccionada.precio_por_ft2)}</span>
                  </div>
                </div>
              </div>

              <div className="detalle-grupo">
                <h3>Resumen Financiero</h3>
                <div className="resumen-financiero">
                  <div className="resumen-item">
                    <span>Subtotal:</span>
                    <span>{formatearMoneda(cotizacionSeleccionada.subtotal)}</span>
                  </div>
                  <div className="resumen-item">
                    <span>ITBMS:</span>
                    <span>{formatearMoneda(cotizacionSeleccionada.itbms || 0)}</span>
                  </div>
                  <div className="resumen-item total-item">
                    <span>Total:</span>
                    <span>{formatearMoneda(cotizacionSeleccionada.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {cotizacionSeleccionada.estado === 'enviada' || cotizacionSeleccionada.estado === 'borrador' ? (
                <>
                  <button
                    className="btn-aprobar"
                    onClick={() => handleCambiarEstado(cotizacionSeleccionada.id, 'aprobada')}
                  >
                    ✅ Aprobar
                  </button>
                  <button
                    className="btn-rechazar"
                    onClick={() => handleCambiarEstado(cotizacionSeleccionada.id, 'rechazada')}
                  >
                    ❌ Rechazar
                  </button>
                </>
              ) : (
                <div className="estado-final">
                  {getEstadoBadge(cotizacionSeleccionada.estado)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelAprobaciones;
