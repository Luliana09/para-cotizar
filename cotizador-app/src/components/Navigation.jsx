import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const { usuario } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      path: '/',
      icon: '🏠',
      label: 'Inicio',
      description: 'Dashboard principal'
    },
    {
      path: '/cotizacion',
      icon: '📝',
      label: 'Sistema de Cotización',
      description: 'Crear nueva cotización'
    },
    {
      path: '/aprobaciones',
      icon: '✅',
      label: 'Panel de Aprobaciones',
      description: 'Aprobar cotizaciones',
      adminOnly: true
    },
    {
      path: '/clientes',
      icon: '👥',
      label: 'Gestión de Clientes',
      description: 'Administrar clientes'
    },
    {
      path: '/usuarios',
      icon: '👤',
      label: 'Gestión de Usuarios',
      description: 'Administrar usuarios',
      adminOnly: true
    },
    {
      path: '/datos-csv',
      icon: '📊',
      label: 'Datos del CSV',
      description: 'Visualizar servicios disponibles'
    },
    {
      path: '/historial',
      icon: '📋',
      label: 'Historial de Cotizaciones',
      description: 'Ver cotizaciones anteriores'
    },
    {
      path: '/cotizaciones-aprobadas',
      icon: '✔️',
      label: 'Cotizaciones Aprobadas',
      description: 'Convertir en órdenes de trabajo'
    },
    {
      path: '/mis-tickets',
      icon: '🎫',
      label: 'Mis Tickets',
      description: 'Órdenes de trabajo'
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <button
        className="nav-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
      >
        {isCollapsed ? '☰' : '✕'}
      </button>

      <nav className={`navigation-panel ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="nav-header">
          <div className="nav-logo">
            <span className="logo-icon">💼</span>
            {!isCollapsed && (
              <div className="logo-text">
                <h2>Cotizador</h2>
                <span>Sistema de Gestión</span>
              </div>
            )}
          </div>
        </div>

        <div className="nav-menu">
          {menuItems
            .filter(item => !item.adminOnly || usuario?.rol === 'admin')
            .map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && (
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                )}
                {isActive(item.path) && <div className="nav-indicator"></div>}
              </Link>
            ))}
        </div>
        <div className="nav-footer">
          {!isCollapsed && (
            <div className="nav-info">
              <div className="nav-info-item">
                <span className="info-icon">📦</span>
                <span className="info-text">v2.3.0</span>
              </div>
              <div className="nav-info-item">
                <span className="info-icon">🔧</span>
                <span className="info-text">React + MySQL</span>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
