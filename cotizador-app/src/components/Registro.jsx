import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Registro.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Registro = () => {
  const navigate = useNavigate();
  const { updateAuth } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmarPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Limpiar error al escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.email.trim()) {
      setError('El email es requerido');
      return;
    }

    if (!formData.password) {
      setError('La contraseña es requerida');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);

      // Hacer petición de registro
      const response = await axios.post(`${API_URL}/auth/registro-publico`, {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        // Guardar token y usuario en localStorage
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('usuario', JSON.stringify(response.data.data.usuario));

        // Actualizar contexto de autenticación
        updateAuth(response.data.data.token, response.data.data.usuario);

        // Redirigir al sistema
        navigate('/');
      }
    } catch (err) {
      console.error('Error en registro:', err);
      const errorMsg = err.response?.data?.message || 'Error al registrar usuario';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-page">
      <div className="registro-container">
        <div className="registro-header">
          <h1 className="registro-title">
            <span className="icon">📝</span>
            Crear Cuenta Nueva
          </h1>
          <p className="registro-subtitle">Regístrate para acceder al Sistema de Cotización</p>
        </div>

        <form onSubmit={handleSubmit} className="registro-form">
          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="nombre">
              <span className="label-icon">👤</span>
              Nombre Completo
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ingrese su nombre completo"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <span className="label-icon">✉️</span>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@correo.com"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <span className="label-icon">🔒</span>
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmarPassword">
              <span className="label-icon">🔒</span>
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmarPassword"
              name="confirmarPassword"
              value={formData.confirmarPassword}
              onChange={handleChange}
              placeholder="Repita su contraseña"
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="btn-registro" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Registrando...
              </>
            ) : (
              <>
                <span className="btn-icon">✓</span>
                Crear Cuenta
              </>
            )}
          </button>

          <div className="registro-footer">
            <p>¿Ya tienes una cuenta?</p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn-link"
              disabled={loading}
            >
              Iniciar Sesión
            </button>
          </div>
        </form>

        <div className="registro-info">
          <div className="info-card">
            <span className="info-icon">ℹ️</span>
            <p>
              Al registrarte obtendrás acceso como <strong>Vendedor</strong>, lo que te permite:
            </p>
            <ul>
              <li>Crear y gestionar clientes</li>
              <li>Generar cotizaciones</li>
              <li>Exportar cotizaciones a PDF</li>
              <li>Enviar cotizaciones por email</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registro;
