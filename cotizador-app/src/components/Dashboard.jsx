import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cotizacionesService, clientesService } from '../services/apiService';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [estadisticas, setEstadisticas] = useState({
    totalCotizaciones: 0,
    cotizacionesAprobadas: 0,
    cotizacionesPendientes: 0,
    totalClientes: 0,
    ventasTotales: 0
  });
  const [ultimasCotizaciones, setUltimasCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar cotizaciones
      const cotizacionesRes = await cotizacionesService.getAll();
      const cotizaciones = cotizacionesRes.data || [];

      // Cargar clientes
      const clientesRes = await clientesService.getAll();
      const clientes = clientesRes.data || [];

      // Calcular estadísticas
      const aprobadas = cotizaciones.filter(c => c.estado === 'aprobada');
      const pendientes = cotizaciones.filter(c => c.estado === 'enviada' || c.estado === 'borrador');
      const ventasTotales = aprobadas.reduce((sum, c) => sum + parseFloat(c.total || 0), 0);

      setEstadisticas({
        totalCotizaciones: cotizaciones.length,
        cotizacionesAprobadas: aprobadas.length,
        cotizacionesPendientes: pendientes.length,
        totalClientes: clientes.length,
        ventasTotales
      });

      // Últimas 5 cotizaciones
      setUltimasCotizaciones(cotizaciones.slice(0, 5));

    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const accionesRapidas = [
    {
      icon: '📝',
      titulo: 'Nueva Cotización',
      descripcion: 'Crear una nueva cotización',
      color: '#3b82f6',
      accion: () => navigate('/cotizacion')
    },
    {
      icon: '👥',
      titulo: 'Gestionar Clientes',
      descripcion: 'Ver y editar clientes',
      color: '#10b981',
      accion: () => navigate('/clientes')
    },
    {
      icon: '📋',
      titulo: 'Ver Historial',
      descripcion: 'Historial de cotizaciones',
      color: '#f59e0b',
      accion: () => navigate('/historial')
    },
    {
      icon: '📊',
      titulo: 'Datos CSV',
      descripcion: 'Visualizar servicios',
      color: '#8b5cf6',
      accion: () => navigate('/datos-csv')
    }
  ];

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'USD'
    }).format(valor);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      'borrador': { label: 'Borrador', color: '#94a3b8' },
      'enviada': { label: 'Enviada', color: '#3b82f6' },
      'aprobada': { label: 'Aprobada', color: '#10b981' },
      'rechazada': { label: 'Rechazada', color: '#ef4444' },
      'vencida': { label: 'Vencida', color: '#f59e0b' }
    };
    const est = estados[estado] || estados['borrador'];
    return (
      <span className="estado-badge" style={{ backgroundColor: est.color }}>
        {est.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            Bienvenido, {usuario?.nombre || 'Usuario'}
          </h1>
          <p className="dashboard-subtitle">
            Panel de control del sistema de cotización
          </p>
        </div>
        <div className="header-date">
          <span className="date-icon">📅</span>
          <span>{new Date().toLocaleDateString('es-PA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeftColor: '#3b82f6' }}>
          <div className="stat-icon" style={{ backgroundColor: '#3b82f620' }}>
            📊
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Cotizaciones</span>
            <span className="stat-value">{estadisticas.totalCotizaciones}</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
          <div className="stat-icon" style={{ backgroundColor: '#10b98120' }}>
            ✅
          </div>
          <div className="stat-content">
            <span className="stat-label">Aprobadas</span>
            <span className="stat-value">{estadisticas.cotizacionesAprobadas}</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="stat-icon" style={{ backgroundColor: '#f59e0b20' }}>
            ⏳
          </div>
          <div className="stat-content">
            <span className="stat-label">Pendientes</span>
            <span className="stat-value">{estadisticas.cotizacionesPendientes}</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeftColor: '#8b5cf6' }}>
          <div className="stat-icon" style={{ backgroundColor: '#8b5cf620' }}>
            👥
          </div>
          <div className="stat-content">
            <span className="stat-label">Clientes</span>
            <span className="stat-value">{estadisticas.totalClientes}</span>
          </div>
        </div>

        <div className="stat-card stat-card-wide" style={{ borderLeftColor: '#06b6d4' }}>
          <div className="stat-icon" style={{ backgroundColor: '#06b6d420' }}>
            💰
          </div>
          <div className="stat-content">
            <span className="stat-label">Ventas Aprobadas</span>
            <span className="stat-value">{formatearMoneda(estadisticas.ventasTotales)}</span>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="dashboard-section">
        <h2 className="section-title">
          <span className="section-icon">⚡</span>
          Acciones Rápidas
        </h2>
        <div className="acciones-grid">
          {accionesRapidas.map((accion, index) => (
            <div
              key={index}
              className="accion-card"
              onClick={accion.accion}
              style={{ borderTopColor: accion.color }}
            >
              <div className="accion-icon" style={{ backgroundColor: `${accion.color}20` }}>
                {accion.icon}
              </div>
              <h3 className="accion-titulo">{accion.titulo}</h3>
              <p className="accion-descripcion">{accion.descripcion}</p>
              <div className="accion-arrow" style={{ color: accion.color }}>→</div>
            </div>
          ))}
        </div>
      </div>

      {/* Últimas Cotizaciones */}
      <div className="dashboard-section">
        <h2 className="section-title">
          <span className="section-icon">📋</span>
          Últimas Cotizaciones
        </h2>
        {ultimasCotizaciones.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No hay cotizaciones registradas</p>
            <button
              className="btn-primary"
              onClick={() => navigate('/cotizacion')}
            >
              Crear Primera Cotización
            </button>
          </div>
        ) : (
          <div className="cotizaciones-lista">
            {ultimasCotizaciones.map((cotizacion) => (
              <div key={cotizacion.id} className="cotizacion-item">
                <div className="cotizacion-header">
                  <span className="cotizacion-numero">{cotizacion.numero_cotizacion}</span>
                  {getEstadoBadge(cotizacion.estado)}
                </div>
                <div className="cotizacion-body">
                  <div className="cotizacion-info">
                    <span className="info-label">Cliente:</span>
                    <span className="info-value">{cotizacion.Cliente?.nombre || 'N/A'}</span>
                  </div>
                  <div className="cotizacion-info">
                    <span className="info-label">Servicio:</span>
                    <span className="info-value">{cotizacion.tipo_servicio}</span>
                  </div>
                  <div className="cotizacion-info">
                    <span className="info-label">Total:</span>
                    <span className="info-value total">{formatearMoneda(cotizacion.total)}</span>
                  </div>
                  <div className="cotizacion-info">
                    <span className="info-label">Fecha:</span>
                    <span className="info-value">{formatearFecha(cotizacion.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info del Sistema */}
      <div className="dashboard-section">
        <h2 className="section-title">
          <span className="section-icon">ℹ️</span>
          Información del Sistema
        </h2>
        <div className="sistema-info">
          <div className="info-card">
            <span className="info-icon">🔧</span>
            <div className="info-text">
              <strong>Versión:</strong> 2.3.0
            </div>
          </div>
          <div className="info-card">
            <span className="info-icon">📦</span>
            <div className="info-text">
              <strong>Backend:</strong> Node.js + MySQL
            </div>
          </div>
          <div className="info-card">
            <span className="info-icon">⚛️</span>
            <div className="info-text">
              <strong>Frontend:</strong> React
            </div>
          </div>
          <div className="info-card">
            <span className="info-icon">👤</span>
            <div className="info-text">
              <strong>Rol:</strong> {usuario?.rol || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
