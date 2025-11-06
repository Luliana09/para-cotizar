import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './GestionUsuarios.css';

const GestionUsuarios = () => {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [alerta, setAlerta] = useState({ tipo: '', mensaje: '' });

  // Formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'vendedor',
    activo: true
  });

  // Función para cargar usuarios
  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      // Importar el servicio de usuarios que crearemos
      const { usuariosService } = await import('../services/apiService');
      const response = await usuariosService.getAll();
      if (response.success) {
        setUsuarios(response.data);
      }
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      mostrarAlerta('error', 'Error al cargar los usuarios');
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

  // Hook useEffect ANTES del return condicional
  useEffect(() => {
    if (usuario?.rol === 'admin') {
      cargarUsuarios();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  // Verificar que el usuario es admin
  if (usuario?.rol !== 'admin') {
    return (
      <div className="gestion-usuarios">
        <div className="error-acceso">
          <h3>⚠️ Acceso Denegado</h3>
          <p>Solo los administradores pueden gestionar usuarios.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setUsuarioEditando(null);
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'vendedor',
      activo: true
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (usuario) => {
    setModoEdicion(true);
    setUsuarioEditando(usuario);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '', // No prellenar password
      rol: usuario.rol,
      activo: usuario.activo
    });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setModoEdicion(false);
    setUsuarioEditando(null);
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'vendedor',
      activo: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.nombre.trim()) {
      mostrarAlerta('error', 'El nombre es requerido');
      return;
    }
    if (!formData.email.trim()) {
      mostrarAlerta('error', 'El email es requerido');
      return;
    }
    if (!modoEdicion && !formData.password.trim()) {
      mostrarAlerta('error', 'La contraseña es requerida para nuevos usuarios');
      return;
    }

    try {
      const { usuariosService } = await import('../services/apiService');

      if (modoEdicion) {
        // Actualizar usuario
        const dataToUpdate = {
          nombre: formData.nombre,
          email: formData.email,
          rol: formData.rol,
          activo: formData.activo
        };
        // Solo incluir password si se proporcionó uno nuevo
        if (formData.password.trim()) {
          dataToUpdate.password = formData.password;
        }

        const response = await usuariosService.update(usuarioEditando.id, dataToUpdate);
        if (response.success) {
          mostrarAlerta('success', '✓ Usuario actualizado exitosamente');
          cargarUsuarios();
          cerrarModal();
        }
      } else {
        // Crear nuevo usuario
        const response = await usuariosService.create(formData);
        if (response.success) {
          mostrarAlerta('success', '✓ Usuario creado exitosamente');
          cargarUsuarios();
          cerrarModal();
        }
      }
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      mostrarAlerta('error', err.response?.data?.message || 'Error al guardar el usuario');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      return;
    }

    try {
      const { usuariosService } = await import('../services/apiService');
      const response = await usuariosService.delete(id);
      if (response.success) {
        mostrarAlerta('success', '✓ Usuario eliminado exitosamente');
        cargarUsuarios();
      }
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      mostrarAlerta('error', 'Error al eliminar el usuario');
    }
  };

  const toggleActivo = async (usuario) => {
    try {
      const { usuariosService } = await import('../services/apiService');
      const response = await usuariosService.update(usuario.id, {
        activo: !usuario.activo
      });
      if (response.success) {
        mostrarAlerta('success', `✓ Usuario ${!usuario.activo ? 'activado' : 'desactivado'} exitosamente`);
        cargarUsuarios();
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      mostrarAlerta('error', 'Error al cambiar el estado del usuario');
    }
  };

  // Filtrar usuarios por búsqueda
  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.rol.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getRolBadgeClass = (rol) => {
    switch (rol) {
      case 'admin': return 'badge-admin';
      case 'vendedor': return 'badge-vendedor';
      case 'visualizador': return 'badge-visualizador';
      default: return '';
    }
  };

  const getRolLabel = (rol) => {
    switch (rol) {
      case 'admin': return 'Administrador';
      case 'vendedor': return 'Vendedor';
      case 'visualizador': return 'Visualizador';
      default: return rol;
    }
  };

  if (loading) {
    return (
      <div className="gestion-usuarios">
        <div className="loading-spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="gestion-usuarios">
      <div className="usuarios-header">
        <h2 className="usuarios-title">
          <span className="icon">👥</span>
          Gestión de Usuarios
        </h2>
        <p className="usuarios-subtitle">Administre los usuarios del sistema y sus permisos</p>
      </div>

      {/* Alertas */}
      {alerta.mensaje && (
        <div className={`alert alert-${alerta.tipo}`}>
          {alerta.mensaje}
        </div>
      )}

      {/* Barra de búsqueda y botón nuevo */}
      <div className="usuarios-actions">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, email o rol..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
        </div>
        <button onClick={abrirModalNuevo} className="btn btn-primary">
          <span className="btn-icon">➕</span>
          Nuevo Usuario
        </button>
      </div>

      {/* Lista de usuarios */}
      {usuariosFiltrados.length === 0 ? (
        <div className="no-usuarios">
          <p>No se encontraron usuarios.</p>
        </div>
      ) : (
        <div className="usuarios-grid">
          {usuariosFiltrados.map((u) => (
            <div key={u.id} className={`usuario-card ${!u.activo ? 'inactivo' : ''}`}>
              <div className="usuario-header">
                <div className="usuario-info">
                  <h3 className="usuario-nombre">{u.nombre}</h3>
                  <p className="usuario-email">{u.email}</p>
                </div>
                <div className={`usuario-badge ${getRolBadgeClass(u.rol)}`}>
                  {getRolLabel(u.rol)}
                </div>
              </div>

              <div className="usuario-details">
                <div className="detail-row">
                  <span className="detail-label">Estado:</span>
                  <span className={`estado-badge ${u.activo ? 'activo' : 'inactivo'}`}>
                    {u.activo ? '✓ Activo' : '✗ Inactivo'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Creado:</span>
                  <span className="detail-value">
                    {new Date(u.createdAt).toLocaleDateString('es-PA')}
                  </span>
                </div>
              </div>

              <div className="usuario-actions">
                <button
                  onClick={() => abrirModalEditar(u)}
                  className="btn-action btn-edit"
                  title="Editar usuario"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => toggleActivo(u)}
                  className={`btn-action ${u.activo ? 'btn-deactivate' : 'btn-activate'}`}
                  title={u.activo ? 'Desactivar' : 'Activar'}
                >
                  {u.activo ? '🚫 Desactivar' : '✓ Activar'}
                </button>
                <button
                  onClick={() => handleEliminar(u.id)}
                  className="btn-action btn-delete"
                  title="Eliminar usuario"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para crear/editar usuario */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {modoEdicion ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}
              </h3>
              <button onClick={cerrarModal} className="modal-close">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="usuario-form">
              <div className="form-group">
                <label htmlFor="nombre">Nombre Completo *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ejemplo@correo.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Contraseña {modoEdicion ? '(Dejar vacío para no cambiar)' : '*'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={modoEdicion ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                  required={!modoEdicion}
                />
              </div>

              <div className="form-group">
                <label htmlFor="rol">Rol *</label>
                <select
                  id="rol"
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  required
                >
                  <option value="visualizador">Visualizador</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="admin">Administrador</option>
                </select>
                <small className="form-help">
                  • Admin: acceso completo<br />
                  • Vendedor: crear/editar cotizaciones y clientes<br />
                  • Visualizador: solo ver información
                </small>
              </div>

              <div className="form-group-checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleInputChange}
                  />
                  Usuario Activo
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={cerrarModal} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {modoEdicion ? 'Actualizar' : 'Crear'} Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;
