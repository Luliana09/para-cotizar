import React from 'react';
import { formatearMoneda, formatearNumero } from '../utils/conversiones';
import './ResultadosCotizacion.css';

const ResultadosCotizacion = ({ resultado, onExportar }) => {
  if (!resultado) return null;

  const { entrada, calculos, validaciones, info } = resultado;

  return (
    <div className="resultados-cotizacion">
      <h2 className="resultados-title">
        <span className="icon">📊</span>
        Resumen de Cotización
      </h2>

      {/* Alertas de Validación */}
      {validaciones.tamañoMinimo && !validaciones.tamañoMinimo.cumple && (
        <div className="alert alert-warning">
          <strong>⚠️ Advertencia:</strong> El área calculada (
          {formatearNumero(calculos.areaTotal)} ft²) es menor al tamaño mínimo
          requerido ({validaciones.tamañoMinimo.tamañoMinimo} ft²).
        </div>
      )}

      {/* Card: Información del Servicio */}
      <div className="result-card">
        <h3 className="card-title">
          <span className="icon">📋</span>
          Información del Servicio
        </h3>
        <div className="result-grid">
          <ResultRow
            label="Tipo de Servicio"
            value={entrada.servicio['TIPO DE SERVICIO']}
          />
          <ResultRow label="Categoría" value={entrada.servicio['CATEGORIA']} />
          <ResultRow
            label="Espesor"
            value={`${entrada.servicio['ESPESOR']} ${entrada.servicio['MILIMETRO O CALIBRE']}`}
          />
          <ResultRow
            label="Dimensiones"
            value={`${entrada.alto} × ${entrada.ancho} ${entrada.unidad}`}
          />
          <ResultRow
            label="Método de Cálculo"
            value={
              entrada.metodoCalculo === 'area'
                ? 'Por Área Total'
                : 'Por Tamaño de Letra'
            }
          />
          <ResultRow
            label="Cantidad"
            value={`${entrada.cantidad} ${
              entrada.metodoCalculo === 'letra' ? 'letra(s)' : 'unidad(es)'
            }`}
          />
        </div>
      </div>

      {/* Card: Desglose de Precios */}
      <div className="result-card">
        <h3 className="card-title">
          <span className="icon">💵</span>
          Desglose de Precios
        </h3>
        <div className="result-list">
          <ResultRow
            label="Área Unitaria"
            value={`${formatearNumero(calculos.areaUnitaria)} ft²`}
          />
          <ResultRow
            label="Área Total"
            value={`${formatearNumero(calculos.areaTotal)} ft²`}
          />
          <ResultRow
            label="Precio por ft²"
            value={formatearMoneda(calculos.precioPorFt2)}
            highlight
          />
          <ResultRow
            label="Precio Base"
            value={formatearMoneda(calculos.precioBase)}
            highlight
          />

          {calculos.recargoColor > 0 && (
            <ResultRow
              label="Recargo Color Personalizado"
              value={formatearMoneda(calculos.recargoColor)}
              highlight
            />
          )}

          <div className="divider"></div>

          <ResultRow
            label="Subtotal"
            value={formatearMoneda(calculos.subtotal)}
            bold
          />

          {calculos.itbms > 0 && (
            <ResultRow
              label="ITBMS (7%)"
              value={formatearMoneda(calculos.itbms)}
              highlight
            />
          )}

          <div className="divider-thick"></div>

          <ResultRow
            label="TOTAL"
            value={formatearMoneda(calculos.total)}
            total
          />
        </div>
      </div>

      {/* Notas Importantes */}
      {info.conLuz && (
        <div className="note-box note-warning">
          <h4 className="note-title">⚠️ NOTA IMPORTANTE - CON LUZ</h4>
          <p>
            Incluye pastillas LED (B/. {info.costosLED.precioLED} c/u) +
            transformador (B/. {info.costosLED.precioTransformador}, rinde{' '}
            {info.costosLED.rendimientoTransformador} ft²), sin base ACM.
          </p>
          {info.costosLED && (
            <p className="note-detail">
              Para el área de {formatearNumero(calculos.areaTotal)} ft² se
              requieren aproximadamente{' '}
              {info.costosLED.cantidadTransformadores} transformador(es).
            </p>
          )}
        </div>
      )}

      {info.esLetrasReforzadas && (
        <div className="note-box note-info">
          <h4 className="note-title">ℹ️ LETRAS REFORZADAS DE ALUCOBOND ACM CON LUZ</h4>
          <p>
            No requiere base ACM adicional, ya que el mismo cuerpo funciona como
            soporte.
          </p>
        </div>
      )}

      {info.condicional && (
        <div className="note-box note-info">
          <h4 className="note-title">📝 Condicionales Aplicadas</h4>
          <p>{info.condicional}</p>
        </div>
      )}

      {/* Botón de Exportar */}
      <div className="result-actions">
        <button onClick={onExportar} className="btn btn-success">
          <span className="btn-icon">📄</span>
          Exportar / Imprimir
        </button>
      </div>
    </div>
  );
};

// Componente auxiliar para filas de resultados
const ResultRow = ({ label, value, highlight, bold, total }) => {
  let className = 'result-row';
  if (highlight) className += ' highlight';
  if (bold) className += ' bold';
  if (total) className += ' total';

  return (
    <div className={className}>
      <span className="result-label">{label}:</span>
      <span className="result-value">{value}</span>
    </div>
  );
};

export default ResultadosCotizacion;
