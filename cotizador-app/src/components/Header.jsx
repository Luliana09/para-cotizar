import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

function Header() {
  const { usuario, logout } = useAuth();

  return (
    <header className="app-header-nav">
      <div className="header-content">
        <div className="header-brand">
          <h1 className="brand-title">
            <span className="brand-icon">🏢</span>
            Sistema de Cotización
          </h1>
        </div>

        <div className="header-user">
          <div className="user-info">
            <span className="user-role-badge">
              {usuario?.rol === 'admin' && '👑 Admin'}
              {usuario?.rol === 'vendedor' && '💼 Vendedor'}
              {usuario?.rol === 'visualizador' && '👁️ Visualizador'}
            </span>
            <span className="user-name">{usuario?.nombre}</span>
            <span className="user-email">{usuario?.email}</span>
          </div>
          <button onClick={logout} className="btn-logout">
            <span className="logout-icon">🚪</span>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
