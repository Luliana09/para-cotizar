import React, { useState, useEffect } from 'react';
import { cotizacionesService } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import './PanelCotizacionesAprobadas.css';

const PanelCotizacionesAprobadas = () => {
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerta, setAlerta] = useState({ tipo: '', mensaje: '' });

  useEffect(() => {
    cargarCotizacionesAprobadas();
  }, []);

  const cargarCotizacionesAprobadas = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando cotizaciones aprobadas...');

      const response = await cotizacionesService.getAll();
      console.log('📦 Respuesta del servidor:', response);

      if (response.success) {
        // Filtrar solo cotizaciones aprobadas (listas para convertir en ticket)
        const aprobadas = response.data.filter(c => c.estado === 'aprobada');
        console.log(`✅ Cotizaciones aprobadas: ${aprobadas.length}`);
        setCotizaciones(aprobadas);

        if (aprobadas.length === 0) {
          mostrarAlerta('info', 'No hay cotizaciones aprobadas pendientes de convertir en orden de trabajo', 5000);
        }
      }
    } catch (error) {
      console.error('❌ Error al cargar cotizaciones:', error);
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

  const handleCrearTicket = (cotizacion) => {
    console.log('📄 Crear ticket para cotización:', cotizacion);
    navigate('/crear-ticket', { state: { cotizacion } });
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'PAB'
    }).format(valor);
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

  if (loading) {
    return (
      <div className="panel-aprobadas-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando cotizaciones aprobadas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-aprobadas-container">
      <div className="panel-header">
        <h2>Cotizaciones Aprobadas</h2>
        <p className="subtitle">Cotizaciones listas para convertir en órdenes de trabajo</p>
      </div>

      {alerta.mensaje && (
        <div className={`alerta alerta-${alerta.tipo}`}>
          {alerta.mensaje}
        </div>
      )}

      {cotizaciones.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No hay cotizaciones aprobadas</h3>
          <p>Las cotizaciones aprobadas por el administrador aparecerán aquí</p>
        </div>
      ) : (
        <div className="cotizaciones-grid">
          {cotizaciones.map(cotizacion => (
            <div key={cotizacion.id} className="cotizacion-card">
              <div className="card-header">
                <div className="numero-cotizacion">
                  {cotizacion.numero_cotizacion}
                </div>
                <div className="badge badge-success">
                  Aprobada
                </div>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="label">Cliente:</span>
                  <span className="value">{cotizacion.cliente?.nombre || 'N/A'}</span>
                </div>

                <div className="info-row">
                  <span className="label">Servicio:</span>
                  <span className="value">{cotizacion.tipo_servicio}</span>
                </div>

                <div className="info-row">
                  <span className="label">Categoría:</span>
                  <span className="value">{cotizacion.categoria}</span>
                </div>

                <div className="info-row">
                  <span className="label">Dimensiones:</span>
                  <span className="value">
                    {cotizacion.alto} x {cotizacion.ancho} {cotizacion.unidad}
                    {cotizacion.cantidad > 1 && ` (x${cotizacion.cantidad})`}
                  </span>
                </div>

                <div className="info-row total-row">
                  <span className="label">Total:</span>
                  <span className="value total">{formatearMoneda(cotizacion.total)}</span>
                </div>

                <div className="info-row">
                  <span className="label">Fecha Aprobación:</span>
                  <span className="value fecha">{formatearFecha(cotizacion.fecha_aprobacion)}</span>
                </div>

                {cotizacion.notas && (
                  <div className="notas-section">
                    <span className="label">Notas:</span>
                    <p className="notas">{cotizacion.notas}</p>
                  </div>
                )}
              </div>

              <div className="card-actions">
                <button
                  onClick={() => handleCrearTicket(cotizacion)}
                  className="btn btn-primary btn-crear-ticket"
                >
                  <span className="btn-icon">🎫</span>
                  Generar Orden de Trabajo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PanelCotizacionesAprobadas;
