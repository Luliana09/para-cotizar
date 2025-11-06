import React, { useState, useEffect } from 'react';
import { clientesService } from '../services/apiService';
import './GestionClientes.css';

function GestionClientes({ onClienteSeleccionado }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    ruc: '',
    cedula: '',
    email: '',
    telefono: '',
    celular: '',
    direccion: '',
    notas: ''
  });
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const response = await clientesService.getAll();
      if (response.success) {
        setClientes(response.data);
      }
    } catch (error) {
      mostrarMensaje('error', 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 4000);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre) {
      mostrarMensaje('error', 'El nombre es requerido');
      return;
    }

    try {
      setLoading(true);
      let response;

      if (clienteEditando) {
        response = await clientesService.update(clienteEditando.id, formData);
        mostrarMensaje('success', 'Cliente actualizado exitosamente');
      } else {
        response = await clientesService.create(formData);
        mostrarMensaje('success', 'Cliente creado exitosamente');
      }

      if (response.success) {
        cargarClientes();
        limpiarFormulario();
        setMostrarFormulario(false);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error al guardar cliente';
      mostrarMensaje('error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (cliente) => {
    setClienteEditando(cliente);
    setFormData({
      nombre: cliente.nombre || '',
      ruc: cliente.ruc || '',
      cedula: cliente.cedula || '',
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      celular: cliente.celular || '',
      direccion: cliente.direccion || '',
      notas: cliente.notas || ''
    });
    setMostrarFormulario(true);
  };

  const limpiarFormulario = () => {
    setFormData({
      nombre: '',
      ruc: '',
      cedula: '',
      email: '',
      telefono: '',
      celular: '',
      direccion: '',
      notas: ''
    });
    setClienteEditando(null);
  };

  const handleNuevoCliente = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (cliente.ruc && cliente.ruc.includes(busqueda)) ||
    (cliente.email && cliente.email.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="gestion-clientes">
      <div className="clientes-header">
        <h3>
          <span className="icon">👥</span>
          Gestión de Clientes
        </h3>
        <button
          className="btn-nuevo-cliente"
          onClick={handleNuevoCliente}
        >
          <span>➕</span> Nuevo Cliente
        </button>
      </div>

      {mensaje.texto && (
        <div className={`mensaje mensaje-${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {mostrarFormulario && (
        <div className="formulario-cliente-container">
          <div className="formulario-cliente">
            <div className="formulario-header">
              <h4>{clienteEditando ? 'Editar Cliente' : 'Nuevo Cliente'}</h4>
              <button
                className="btn-cerrar"
                onClick={() => {
                  setMostrarFormulario(false);
                  limpiarFormulario();
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>RUC</label>
                  <input
                    type="text"
                    name="ruc"
                    value={formData.ruc}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Cédula</label>
                  <input
                    type="text"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Celular</label>
                  <input
                    type="tel"
                    name="celular"
                    value={formData.celular}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group form-group-full">
                  <label>Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group form-group-full">
                  <label>Notas</label>
                  <textarea
                    name="notas"
                    value={formData.notas}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => {
                    setMostrarFormulario(false);
                    limpiarFormulario();
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-guardar"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : clienteEditando ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="clientes-busqueda">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre, RUC o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-busqueda"
        />
      </div>

      {loading && !mostrarFormulario ? (
        <div className="loading">Cargando clientes...</div>
      ) : (
        <div className="clientes-lista">
          {clientesFiltrados.length === 0 ? (
            <div className="sin-clientes">
              <p>No hay clientes registrados</p>
              <button className="btn-primary" onClick={handleNuevoCliente}>
                Crear primer cliente
              </button>
            </div>
          ) : (
            <div className="clientes-grid">
              {clientesFiltrados.map((cliente) => (
                <div key={cliente.id} className="cliente-card">
                  <div className="cliente-info">
                    <h4>{cliente.nombre}</h4>
                    {cliente.ruc && <p><strong>RUC:</strong> {cliente.ruc}</p>}
                    {cliente.cedula && <p><strong>Cédula:</strong> {cliente.cedula}</p>}
                    {cliente.email && <p><strong>Email:</strong> {cliente.email}</p>}
                    {cliente.celular && <p><strong>Celular:</strong> {cliente.celular}</p>}
                  </div>
                  <div className="cliente-acciones">
                    <button
                      className="btn-seleccionar"
                      onClick={() => onClienteSeleccionado && onClienteSeleccionado(cliente)}
                    >
                      ✓ Seleccionar
                    </button>
                    <button
                      className="btn-editar"
                      onClick={() => handleEditar(cliente)}
                    >
                      ✎ Editar
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
}

export default GestionClientes;
