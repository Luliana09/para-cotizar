import React, { useState, useEffect } from 'react';
import { formatearMoneda, formatearNumero } from '../utils/conversiones';
import './HistorialCotizaciones.css';

const HistorialCotizaciones = ({ onCargarCotizacion }) => {
  const [historial, setHistorial] = useState([]);
  const [mostrar, setMostrar] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = () => {
    try {
      const historialGuardado = localStorage.getItem('historialCotizaciones');
      if (historialGuardado) {
        const datos = JSON.parse(historialGuardado);
        setHistorial(datos.sort((a, b) => b.fecha - a.fecha));
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
    }
  };

  const guardarCotizacion = (resultado) => {
    try {
      const nuevaCotizacion = {
        id: Date.now(),
        fecha: Date.now(),
        ...resultado
      };

      const historialActual = [...historial, nuevaCotizacion];

      // Limitar a las últimas 50 cotizaciones
      const historialLimitado = historialActual.slice(-50);

      localStorage.setItem('historialCotizaciones', JSON.stringify(historialLimitado));
      setHistorial(historialLimitado.sort((a, b) => b.fecha - a.fecha));

      return true;
    } catch (error) {
      console.error('Error al guardar cotización:', error);
      return false;
    }
  };

  const eliminarCotizacion = (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta cotización?')) return;

    const nuevoHistorial = historial.filter(c => c.id !== id);
    localStorage.setItem('historialCotizaciones', JSON.stringify(nuevoHistorial));
    setHistorial(nuevoHistorial);
  };

  const limpiarHistorial = () => {
    if (!window.confirm('¿Está seguro de eliminar TODAS las cotizaciones del historial?')) return;

    localStorage.removeItem('historialCotizaciones');
    setHistorial([]);
  };

  const filtrarHistorial = () => {
    if (!busqueda) return historial;

    return historial.filter(cotizacion => {
      const textoServicio = cotizacion.entrada?.servicio?.['TIPO DE SERVICIO'] || '';
      const textoCategoria = cotizacion.entrada?.servicio?.['CATEGORIA'] || '';
      const textoBusqueda = busqueda.toLowerCase();

      return (
        textoServicio.toLowerCase().includes(textoBusqueda) ||
        textoCategoria.toLowerCase().includes(textoBusqueda)
      );
    });
  };

  const formatearFecha = (timestamp) => {
    const fecha = new Date(timestamp);
    return fecha.toLocaleString('es-PA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const historialFiltrado = filtrarHistorial();

  // Exponer función de guardado
  React.useImperativeHandle(
    React.useRef(),
    () => ({
      guardarCotizacion
    })
  );

  return (
    <div className="historial-cotizaciones">
      <button
        className="btn-toggle-historial"
        onClick={() => setMostrar(!mostrar)}
      >
        <span className="icon">📜</span>
        {mostrar ? 'Ocultar Historial' : 'Ver Historial de Cotizaciones'}
        {historial.length > 0 && (
          <span className="badge-count">{historial.length}</span>
        )}
      </button>

      {mostrar && (
        <div className="historial-content">
          <div className="historial-header">
            <div className="historial-stats">
              <div className="stat">
                <span className="stat-icon">📊</span>
                <div className="stat-info">
                  <div className="stat-value">{historial.length}</div>
                  <div className="stat-label">Cotizaciones</div>
                </div>
              </div>
              <div className="stat">
                <span className="stat-icon">💰</span>
                <div className="stat-info">
                  <div className="stat-value">
                    {formatearMoneda(
                      historial.reduce((sum, c) => sum + (c.calculos?.total || 0), 0)
                    )}
                  </div>
                  <div className="stat-label">Total Acumulado</div>
                </div>
              </div>
            </div>

            <div className="historial-actions">
              <input
                type="text"
                placeholder="🔍 Buscar por servicio o categoría..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="search-input"
              />
              {historial.length > 0 && (
                <button
                  onClick={limpiarHistorial}
                  className="btn btn-danger-outline"
                >
                  🗑️ Limpiar Todo
                </button>
              )}
            </div>
          </div>

          {historialFiltrado.length === 0 ? (
            <div className="historial-vacio">
              <div className="vacio-icon">📋</div>
              <p>
                {busqueda
                  ? 'No se encontraron cotizaciones con ese criterio'
                  : 'No hay cotizaciones en el historial'}
              </p>
              <p className="vacio-hint">
                Las cotizaciones que calcules se guardarán automáticamente aquí
              </p>
            </div>
          ) : (
            <div className="historial-lista">
              {historialFiltrado.map((cotizacion) => (
                <div key={cotizacion.id} className="cotizacion-card">
                  <div className="cotizacion-header">
                    <div className="cotizacion-info">
                      <h4 className="cotizacion-titulo">
                        {cotizacion.entrada?.servicio?.['TIPO DE SERVICIO']}
                      </h4>
                      <p className="cotizacion-categoria">
                        {cotizacion.entrada?.servicio?.['CATEGORIA']}
                      </p>
                    </div>
                    <div className="cotizacion-precio">
                      {formatearMoneda(cotizacion.calculos?.total || 0)}
                    </div>
                  </div>

                  <div className="cotizacion-detalles">
                    <div className="detalle-item">
                      <span className="detalle-label">Dimensiones:</span>
                      <span className="detalle-value">
                        {cotizacion.entrada?.alto} × {cotizacion.entrada?.ancho}{' '}
                        {cotizacion.entrada?.unidad}
                      </span>
                    </div>
                    <div className="detalle-item">
                      <span className="detalle-label">Área:</span>
                      <span className="detalle-value">
                        {formatearNumero(cotizacion.calculos?.areaTotal || 0)} ft²
                      </span>
                    </div>
                    <div className="detalle-item">
                      <span className="detalle-label">Fecha:</span>
                      <span className="detalle-value">
                        {formatearFecha(cotizacion.fecha)}
                      </span>
                    </div>
                  </div>

                  <div className="cotizacion-acciones">
                    <button
                      onClick={() => onCargarCotizacion && onCargarCotizacion(cotizacion)}
                      className="btn-accion btn-primary-small"
                      title="Ver detalles"
                    >
                      👁️ Ver
                    </button>
                    <button
                      onClick={() => eliminarCotizacion(cotizacion.id)}
                      className="btn-accion btn-danger-small"
                      title="Eliminar"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Función auxiliar para usar desde otros componentes
export const guardarEnHistorial = (resultado) => {
  try {
    const historialActual = JSON.parse(localStorage.getItem('historialCotizaciones') || '[]');

    const nuevaCotizacion = {
      id: Date.now(),
      fecha: Date.now(),
      ...resultado
    };

    historialActual.push(nuevaCotizacion);

    // Limitar a las últimas 50 cotizaciones
    const historialLimitado = historialActual.slice(-50);

    localStorage.setItem('historialCotizaciones', JSON.stringify(historialLimitado));
    return true;
  } catch (error) {
    console.error('Error al guardar en historial:', error);
    return false;
  }
};

export default HistorialCotizaciones;
