/**
 * Servicio para exportar cotizaciones a PDF
 */

import { formatearMoneda, formatearNumero } from '../utils/conversiones';

export const generarPDF = (resultado) => {
  if (!resultado) return;

  const { entrada, calculos, info } = resultado;

  // Crear contenido HTML para el PDF
  const contenidoHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Cotización - ${entrada.servicio['CATEGORIA']}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #667eea;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #667eea;
          margin-bottom: 10px;
        }
        .header p {
          color: #666;
          margin: 5px 0;
        }
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .section-title {
          background: #667eea;
          color: white;
          padding: 10px 15px;
          border-radius: 5px;
          margin-bottom: 15px;
          font-size: 16px;
          font-weight: bold;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 5px;
          margin-bottom: 8px;
        }
        .info-label {
          font-weight: 600;
          color: #555;
        }
        .info-value {
          color: #667eea;
          font-weight: 700;
        }
        .calculations {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }
        .calc-row {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          border-bottom: 1px solid #dee2e6;
        }
        .calc-row.subtotal {
          background: #fff3cd;
          font-weight: 700;
          margin-top: 10px;
        }
        .calc-row.total {
          background: #667eea;
          color: white;
          font-size: 18px;
          font-weight: 700;
          margin-top: 10px;
          border: none;
        }
        .note-box {
          background: #fff3cd;
          border: 2px solid #ffc107;
          border-radius: 8px;
          padding: 15px;
          margin-top: 20px;
        }
        .note-title {
          color: #856404;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .note-text {
          color: #856404;
          line-height: 1.6;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #999;
          font-size: 12px;
          border-top: 1px solid #dee2e6;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏢 COTIZACIÓN DE SERVICIO</h1>
        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-PA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>
        <p><strong>Hora:</strong> ${new Date().toLocaleTimeString('es-PA')}</p>
      </div>

      <div class="section">
        <div class="section-title">📋 INFORMACIÓN DEL SERVICIO</div>
        <div class="info-row">
          <span class="info-label">Tipo de Servicio:</span>
          <span class="info-value">${entrada.servicio['TIPO DE SERVICIO']}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Categoría:</span>
          <span class="info-value">${entrada.servicio['CATEGORIA']}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Espesor:</span>
          <span class="info-value">${entrada.servicio['ESPESOR']} ${entrada.servicio['MILIMETRO O CALIBRE']}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Dimensiones:</span>
          <span class="info-value">${entrada.alto} × ${entrada.ancho} ${entrada.unidad}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Método de Cálculo:</span>
          <span class="info-value">${entrada.metodoCalculo === 'area' ? 'Por Área Total' : 'Por Tamaño de Letra'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Cantidad:</span>
          <span class="info-value">${entrada.cantidad} ${entrada.metodoCalculo === 'letra' ? 'letra(s)' : 'unidad(es)'}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">💵 DESGLOSE DE PRECIOS</div>
        <div class="calculations">
          <div class="calc-row">
            <span>Área Unitaria:</span>
            <span>${formatearNumero(calculos.areaUnitaria)} ft²</span>
          </div>
          <div class="calc-row">
            <span>Área Total:</span>
            <span>${formatearNumero(calculos.areaTotal)} ft²</span>
          </div>
          <div class="calc-row">
            <span>Precio por ft²:</span>
            <span>${formatearMoneda(calculos.precioPorFt2)}</span>
          </div>
          <div class="calc-row">
            <span>Precio Base:</span>
            <span>${formatearMoneda(calculos.precioBase)}</span>
          </div>
          ${calculos.recargoColor > 0 ? `
          <div class="calc-row">
            <span>Recargo Color Personalizado:</span>
            <span>${formatearMoneda(calculos.recargoColor)}</span>
          </div>
          ` : ''}
          <div class="calc-row subtotal">
            <span>Subtotal:</span>
            <span>${formatearMoneda(calculos.subtotal)}</span>
          </div>
          ${calculos.itbms > 0 ? `
          <div class="calc-row">
            <span>ITBMS (7%):</span>
            <span>${formatearMoneda(calculos.itbms)}</span>
          </div>
          ` : ''}
          <div class="calc-row total">
            <span>TOTAL:</span>
            <span>${formatearMoneda(calculos.total)}</span>
          </div>
        </div>
      </div>

      ${info.conLuz ? `
      <div class="note-box">
        <div class="note-title">⚠️ NOTA IMPORTANTE - CON LUZ</div>
        <div class="note-text">
          Incluye pastillas LED (B/. ${info.costosLED.precioLED} c/u) +
          transformador (B/. ${info.costosLED.precioTransformador}, rinde ${info.costosLED.rendimientoTransformador} ft²),
          sin base ACM.
          <br><br>
          Para el área de ${formatearNumero(calculos.areaTotal)} ft² se requieren aproximadamente
          ${info.costosLED.cantidadTransformadores} transformador(es).
        </div>
      </div>
      ` : ''}

      ${info.esLetrasReforzadas ? `
      <div class="note-box">
        <div class="note-title">ℹ️ LETRAS REFORZADAS DE ALUCOBOND ACM CON LUZ</div>
        <div class="note-text">
          No requiere base ACM adicional, ya que el mismo cuerpo funciona como soporte.
        </div>
      </div>
      ` : ''}

      ${info.condicional ? `
      <div class="note-box">
        <div class="note-title">📝 CONDICIONALES APLICADAS</div>
        <div class="note-text">
          ${info.condicional}
        </div>
      </div>
      ` : ''}

      <div class="footer">
        <p>Este documento es una cotización no vinculante.</p>
        <p>Los precios están sujetos a cambios sin previo aviso.</p>
        <p>Generado el ${new Date().toLocaleString('es-PA')}</p>
      </div>
    </body>
    </html>
  `;

  // Abrir ventana de impresión
  const ventana = window.open('', '', 'width=800,height=600');
  ventana.document.write(contenidoHTML);
  ventana.document.close();
  ventana.focus();

  // Esperar a que se cargue el contenido antes de imprimir
  setTimeout(() => {
    ventana.print();
  }, 250);
};

export const descargarJSON = (resultado, nombre = 'cotizacion') => {
  const dataStr = JSON.stringify(resultado, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${nombre}_${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
