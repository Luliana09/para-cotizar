import React, { useState, useEffect } from 'react';
import { UNIDADES } from '../utils/conversiones';
import {
  obtenerTiposServicio,
  obtenerCategoriasPorTipo,
  obtenerServiciosPorTipoCategoria
} from '../services/csvService';
import './FormularioCotizacion.css';

const FormularioCotizacion = ({ serviciosData, onCalcular, onLimpiar }) => {
  // Estados del formulario
  const [tipoServicio, setTipoServicio] = useState('');
  const [categoria, setCategoria] = useState('');
  const [espesor, setEspesor] = useState('');
  const [metodoCalculo, setMetodoCalculo] = useState('area');
  const [unidadMedida, setUnidadMedida] = useState(UNIDADES.FT);
  const [alto, setAlto] = useState('');
  const [ancho, setAncho] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [colorPersonalizado, setColorPersonalizado] = useState(false);
  const [aplicarITBMS, setAplicarITBMS] = useState(false);

  // Estados para opciones dinámicas
  const [categorias, setCategorias] = useState([]);
  const [espesores, setEspesores] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  // Estados de visualización
  const [mostrarMetodo, setMostrarMetodo] = useState(false);
  const [mostrarColor, setMostrarColor] = useState(false);
  const [mostrarEspesor, setMostrarEspesor] = useState(false);

  const tiposServicio = obtenerTiposServicio(serviciosData);

  // Efecto: Actualizar categorías cuando cambia tipo de servicio
  useEffect(() => {
    if (tipoServicio) {
      const cats = obtenerCategoriasPorTipo(serviciosData, tipoServicio);
      setCategorias(cats);
      setCategoria('');
      setEspesor('');

      // Mostrar selector de método solo para letras formadas/recortadas
      const esLetras =
        tipoServicio === 'LETRAS FORMADAS' || tipoServicio === 'LETRAS RECORTADAS';
      setMostrarMetodo(esLetras);
      setMostrarColor(tipoServicio === 'LETRAS RECORTADAS');
    } else {
      setCategorias([]);
      setMostrarMetodo(false);
      setMostrarColor(false);
    }
  }, [tipoServicio, serviciosData]);

  // Efecto: Actualizar espesores cuando cambia categoría
  useEffect(() => {
    if (categoria) {
      const servicios = obtenerServiciosPorTipoCategoria(
        serviciosData,
        tipoServicio,
        categoria
      );

      if (servicios.length > 1) {
        setEspesores(servicios);
        setMostrarEspesor(true);
        setServicioSeleccionado(null);
      } else {
        setMostrarEspesor(false);
        setServicioSeleccionado(servicios[0]);
      }
    } else {
      setMostrarEspesor(false);
      setServicioSeleccionado(null);
    }
  }, [categoria, tipoServicio, serviciosData]);

  // Efecto: Actualizar servicio seleccionado cuando cambia espesor
  useEffect(() => {
    if (espesor && espesores.length > 0) {
      setServicioSeleccionado(espesores[parseInt(espesor)]);
    }
  }, [espesor, espesores]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!servicioSeleccionado) {
      alert('Por favor, seleccione un servicio válido');
      return;
    }

    const datos = {
      servicio: servicioSeleccionado,
      alto: parseFloat(alto),
      ancho: parseFloat(ancho),
      unidad: unidadMedida,
      metodoCalculo,
      cantidad: parseInt(cantidad),
      colorPersonalizado,
      aplicarITBMS
    };

    onCalcular(datos);
  };

  const handleReset = () => {
    setTipoServicio('');
    setCategoria('');
    setEspesor('');
    setMetodoCalculo('area');
    setUnidadMedida(UNIDADES.FT);
    setAlto('');
    setAncho('');
    setCantidad(1);
    setColorPersonalizado(false);
    setAplicarITBMS(false);
    setServicioSeleccionado(null);
    if (onLimpiar) onLimpiar();
  };

  return (
    <form onSubmit={handleSubmit} className="formulario-cotizacion">
      {/* Sección: Selección de Servicio */}
      <div className="form-section">
        <h2 className="section-title">
          <span className="icon">🔧</span>
          Configuración del Servicio
        </h2>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="tipoServicio">Tipo de Servicio *</label>
            <select
              id="tipoServicio"
              value={tipoServicio}
              onChange={(e) => setTipoServicio(e.target.value)}
              required
              className="form-control"
            >
              <option value="">-- Seleccione --</option>
              {tiposServicio.map((tipo, idx) => (
                <option key={idx} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="categoria">Categoría *</label>
            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              disabled={!tipoServicio}
              required
              className="form-control"
            >
              <option value="">-- Seleccione --</option>
              {categorias.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {mostrarEspesor && (
            <div className="form-group">
              <label htmlFor="espesor">Espesor *</label>
              <select
                id="espesor"
                value={espesor}
                onChange={(e) => setEspesor(e.target.value)}
                required
                className="form-control"
              >
                <option value="">-- Seleccione --</option>
                {espesores.map((s, idx) => {
                  const espesorTexto =
                    s['ESPESOR'] +
                    (s['MILIMETRO O CALIBRE'] !== 'N/A'
                      ? ' ' + s['MILIMETRO O CALIBRE']
                      : '');
                  return (
                    <option key={idx} value={idx}>
                      {espesorTexto}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Sección: Método de Cálculo */}
      {mostrarMetodo && (
        <div className="method-selector">
          <h3 className="method-title">
            <span className="icon">📐</span>
            Método de Cálculo
          </h3>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="metodoCalculo"
                value="area"
                checked={metodoCalculo === 'area'}
                onChange={(e) => setMetodoCalculo(e.target.value)}
              />
              <span className="radio-label">Por Área Total (ft²)</span>
              <span className="radio-description">
                Calcula el precio basado en el área total
              </span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="metodoCalculo"
                value="letra"
                checked={metodoCalculo === 'letra'}
                onChange={(e) => setMetodoCalculo(e.target.value)}
              />
              <span className="radio-label">Por Tamaño de Letra</span>
              <span className="radio-description">
                Calcula el precio por cada letra individual
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Sección: Dimensiones */}
      <div className="form-section">
        <h2 className="section-title">
          <span className="icon">📏</span>
          Dimensiones
        </h2>

        <div className="form-group">
          <label htmlFor="unidadMedida">Unidad de Medida</label>
          <select
            id="unidadMedida"
            value={unidadMedida}
            onChange={(e) => setUnidadMedida(e.target.value)}
            className="form-control"
          >
            <option value={UNIDADES.FT}>Pies (ft)</option>
            <option value={UNIDADES.IN}>Pulgadas (in)</option>
            <option value={UNIDADES.CM}>Centímetros (cm)</option>
            <option value={UNIDADES.M}>Metros (m)</option>
          </select>
        </div>

        <div className="dimensions-grid">
          <div className="form-group">
            <label htmlFor="alto">Alto *</label>
            <input
              type="number"
              id="alto"
              value={alto}
              onChange={(e) => setAlto(e.target.value)}
              step="0.01"
              min="0"
              required
              className="form-control"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="ancho">Ancho *</label>
            <input
              type="number"
              id="ancho"
              value={ancho}
              onChange={(e) => setAncho(e.target.value)}
              step="0.01"
              min="0"
              required
              className="form-control"
              placeholder="0.00"
            />
          </div>

          {metodoCalculo === 'letra' && (
            <div className="form-group">
              <label htmlFor="cantidad">Cantidad de Letras *</label>
              <input
                type="number"
                id="cantidad"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                min="1"
                required
                className="form-control"
                placeholder="1"
              />
            </div>
          )}
        </div>
      </div>

      {/* Sección: Opciones Adicionales */}
      <div className="form-section">
        <h2 className="section-title">
          <span className="icon">⚙️</span>
          Opciones Adicionales
        </h2>

        {mostrarColor && (
          <label className="checkbox-group">
            <input
              type="checkbox"
              checked={colorPersonalizado}
              onChange={(e) => setColorPersonalizado(e.target.checked)}
            />
            <span className="checkbox-content">
              <span className="checkbox-label">🎨 Color Personalizado</span>
              <span className="checkbox-description">
                Agregar $2.00 por ft² (solo para Letras Recortadas)
              </span>
            </span>
          </label>
        )}

        <label className="checkbox-group">
          <input
            type="checkbox"
            checked={aplicarITBMS}
            onChange={(e) => setAplicarITBMS(e.target.checked)}
          />
          <span className="checkbox-content">
            <span className="checkbox-label">💰 Aplicar ITBMS</span>
            <span className="checkbox-description">
              Agregar 7% de impuesto sobre el subtotal
            </span>
          </span>
        </label>
      </div>

      {/* Botones de Acción */}
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          <span className="btn-icon">🧮</span>
          Calcular Cotización
        </button>
        <button type="button" onClick={handleReset} className="btn btn-secondary">
          <span className="btn-icon">🔄</span>
          Limpiar Formulario
        </button>
      </div>
    </form>
  );
};

export default FormularioCotizacion;
