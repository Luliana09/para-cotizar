import React, { useState } from 'react';
import './VisualizadorCSV.css';

const VisualizadorCSV = ({ serviciosData }) => {
  const [mostrar, setMostrar] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('');

  if (!serviciosData || serviciosData.length === 0) return null;

  // Obtener estadísticas
  const tiposUnicos = [...new Set(serviciosData.map(s => s['TIPO DE SERVICIO']))];
  const categoriasUnicas = [...new Set(serviciosData.map(s => s['CATEGORIA']))];
  const serviciosConLuz = serviciosData.filter(s => s['CON LUZ'] === 'SI').length;
  const serviciosSinLuz = serviciosData.filter(s => s['CON LUZ'] === 'NO').length;

  // Filtrar servicios
  const serviciosFiltrados = filtroTipo
    ? serviciosData.filter(s => s['TIPO DE SERVICIO'] === filtroTipo)
    : serviciosData;

  return (
    <div className="visualizador-csv">
      <button
        className="btn-toggle-visualizador"
        onClick={() => setMostrar(!mostrar)}
      >
        <span className="icon">{mostrar ? '📊' : '📊'}</span>
        {mostrar ? 'Ocultar Datos del CSV' : 'Ver Datos del CSV'}
      </button>

      {mostrar && (
        <div className="visualizador-content">
          {/* Estadísticas Generales */}
          <div className="stats-grid">
            <div className="stat-card stat-primary">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <div className="stat-value">{serviciosData.length}</div>
                <div className="stat-label">Total Servicios</div>
              </div>
            </div>

            <div className="stat-card stat-success">
              <div className="stat-icon">🏷️</div>
              <div className="stat-info">
                <div className="stat-value">{tiposUnicos.length}</div>
                <div className="stat-label">Tipos de Servicio</div>
              </div>
            </div>

            <div className="stat-card stat-info">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <div className="stat-value">{categoriasUnicas.length}</div>
                <div className="stat-label">Categorías</div>
              </div>
            </div>

            <div className="stat-card stat-warning">
              <div className="stat-icon">💡</div>
              <div className="stat-info">
                <div className="stat-value">{serviciosConLuz}</div>
                <div className="stat-label">Con Luz</div>
              </div>
            </div>
          </div>

          {/* Distribución por Tipo */}
          <div className="distribucion-section">
            <h3>📊 Distribución por Tipo de Servicio</h3>
            <div className="tipos-grid">
              {tiposUnicos.map((tipo, idx) => {
                const cantidad = serviciosData.filter(
                  s => s['TIPO DE SERVICIO'] === tipo
                ).length;
                const porcentaje = ((cantidad / serviciosData.length) * 100).toFixed(1);

                return (
                  <div key={idx} className="tipo-card">
                    <div className="tipo-header">
                      <span className="tipo-nombre">{tipo}</span>
                      <span className="tipo-cantidad">{cantidad}</span>
                    </div>
                    <div className="tipo-progress">
                      <div
                        className="tipo-progress-bar"
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                    <div className="tipo-porcentaje">{porcentaje}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabla de Servicios */}
          <div className="tabla-section">
            <div className="tabla-header">
              <h3>📝 Lista de Servicios</h3>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="filtro-select"
              >
                <option value="">Todos los tipos</option>
                {tiposUnicos.map((tipo, idx) => (
                  <option key={idx} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div className="tabla-scroll">
              <table className="servicios-tabla">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tipo</th>
                    <th>Categoría</th>
                    <th>Precio/ft²</th>
                    <th>Espesor</th>
                    <th>Con Luz</th>
                    <th>Tamaño Mín.</th>
                  </tr>
                </thead>
                <tbody>
                  {serviciosFiltrados.map((servicio, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <span className="badge badge-tipo">
                          {servicio['TIPO DE SERVICIO']}
                        </span>
                      </td>
                      <td>{servicio['CATEGORIA']}</td>
                      <td className="precio-cell">{servicio['PRECIO BASE EN PIE2']}</td>
                      <td>
                        {servicio['ESPESOR']} {servicio['MILIMETRO O CALIBRE']}
                      </td>
                      <td>
                        {servicio['CON LUZ'] === 'SI' ? (
                          <span className="badge badge-luz">💡 Sí</span>
                        ) : servicio['CON LUZ'] === 'NO' ? (
                          <span className="badge badge-sin-luz">No</span>
                        ) : (
                          <span className="badge badge-na">N/A</span>
                        )}
                      </td>
                      <td>{servicio['TAMAÑO MINIMO EN PIE2']} ft²</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Información de Condicionales */}
          <div className="condicionales-section">
            <h3>⚙️ Servicios con Condicionales Especiales</h3>
            <div className="condicionales-grid">
              {serviciosData
                .filter(s => s['CONDICIONAL'] && s['CONDICIONAL'].trim())
                .map((servicio, idx) => (
                  <div key={idx} className="condicional-card">
                    <div className="condicional-header">
                      <strong>{servicio['CATEGORIA']}</strong>
                    </div>
                    <div className="condicional-body">
                      {servicio['CONDICIONAL']}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualizadorCSV;
