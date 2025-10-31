/**
 * Servicio para exportar cotizaciones a PDF
 */

import jsPDF from 'jspdf';
import { formatearMoneda, formatearNumero } from '../utils/conversiones';

export const generarPDF = (resultado) => {
  if (!resultado) return;

  const { entrada, calculos, validaciones, info } = resultado;

  // Crear instancia de jsPDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  // Colores
  const colorPrimario = [102, 126, 234]; // #667eea
  const colorTexto = [51, 51, 51];
  const colorSecundario = [102, 102, 102];

  let y = 20; // Posición vertical inicial

  // ENCABEZADO
  doc.setFillColor(...colorPrimario);
  doc.rect(0, 0, 220, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('COTIZACIÓN DE SERVICIO', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const fecha = new Date().toLocaleDateString('es-PA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const hora = new Date().toLocaleTimeString('es-PA');
  doc.text(`Fecha: ${fecha}`, 105, 28, { align: 'center' });
  doc.text(`Hora: ${hora}`, 105, 34, { align: 'center' });

  y = 50;

  // SECCIÓN: INFORMACIÓN DEL SERVICIO
  doc.setFillColor(...colorPrimario);
  doc.rect(15, y, 180, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DEL SERVICIO', 20, y + 5.5);

  y += 12;
  doc.setTextColor(...colorTexto);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const infoData = [
    ['Tipo de Servicio:', entrada.servicio['TIPO DE SERVICIO']],
    ['Categoría:', entrada.servicio['CATEGORIA']],
    ['Espesor:', `${entrada.servicio['ESPESOR']} ${entrada.servicio['MILIMETRO O CALIBRE']}`],
    ['Dimensiones:', `${entrada.alto} × ${entrada.ancho} ${entrada.unidad}`],
    ['Método de Cálculo:', entrada.metodoCalculo === 'area' ? 'Por Área Total' : 'Por Tamaño de Letra'],
    ['Cantidad:', `${entrada.cantidad} ${entrada.metodoCalculo === 'letra' ? 'letra(s)' : 'unidad(es)'}`]
  ];

  infoData.forEach(([label, value]) => {
    doc.setFillColor(248, 249, 250);
    doc.rect(15, y, 180, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colorPrimario);
    doc.text(value, 190, y + 5.5, { align: 'right' });
    doc.setTextColor(...colorTexto);
    y += 9;
  });

  y += 5;

  // SECCIÓN: DESGLOSE DE PRECIOS
  doc.setFillColor(...colorPrimario);
  doc.rect(15, y, 180, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DESGLOSE DE PRECIOS', 20, y + 5.5);

  y += 12;
  doc.setTextColor(...colorTexto);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const preciosData = [
    ['Área Unitaria:', `${formatearNumero(calculos.areaUnitaria)} ft²`],
    ['Área Total:', `${formatearNumero(calculos.areaTotal)} ft²`],
    ['Precio por ft²:', formatearMoneda(calculos.precioPorFt2)],
    ['Precio Base:', formatearMoneda(calculos.precioBase)]
  ];

  if (calculos.recargoColor > 0) {
    preciosData.push(['Recargo Color Personalizado:', formatearMoneda(calculos.recargoColor)]);
  }

  preciosData.forEach(([label, value]) => {
    doc.setFillColor(248, 249, 250);
    doc.rect(15, y, 180, 8, 'F');
    doc.setFont('helvetica', 'normal');
    doc.text(label, 20, y + 5.5);
    doc.setFont('helvetica', 'bold');
    doc.text(value, 190, y + 5.5, { align: 'right' });
    y += 9;
  });

  // Subtotal
  doc.setFillColor(255, 243, 205);
  doc.rect(15, y, 180, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', 20, y + 5.5);
  doc.text(formatearMoneda(calculos.subtotal), 190, y + 5.5, { align: 'right' });
  y += 9;

  // ITBMS
  if (calculos.itbms > 0) {
    doc.setFillColor(248, 249, 250);
    doc.rect(15, y, 180, 8, 'F');
    doc.setFont('helvetica', 'normal');
    doc.text('ITBMS (7%):', 20, y + 5.5);
    doc.setFont('helvetica', 'bold');
    doc.text(formatearMoneda(calculos.itbms), 190, y + 5.5, { align: 'right' });
    y += 9;
  }

  // TOTAL
  doc.setFillColor(...colorPrimario);
  doc.rect(15, y, 180, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', 20, y + 7);
  doc.text(formatearMoneda(calculos.total), 190, y + 7, { align: 'right' });

  y += 15;

  // ADVERTENCIA DE TAMAÑO MÍNIMO
  if (validaciones.tamañoMinimo && !validaciones.tamañoMinimo.cumple) {
    doc.setFillColor(255, 243, 205);
    doc.setDrawColor(255, 193, 7);
    doc.setLineWidth(0.5);
    doc.rect(15, y, 180, 12, 'FD');
    doc.setTextColor(133, 100, 4);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('ADVERTENCIA:', 20, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `El área calculada (${formatearNumero(calculos.areaTotal)} ft²) es menor al tamaño mínimo`,
      20,
      y + 9
    );
    y += 14;
  }

  // NOTAS
  doc.setTextColor(...colorTexto);

  if (info.conLuz) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(255, 243, 205);
    doc.setDrawColor(255, 193, 7);
    doc.rect(15, y, 180, 25, 'FD');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(133, 100, 4);
    doc.text('NOTA IMPORTANTE - CON LUZ', 20, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const textoLuz = `Incluye pastillas LED (B/. ${info.costosLED.precioLED} c/u) + transformador (B/. ${info.costosLED.precioTransformador}, rinde ${info.costosLED.rendimientoTransformador} ft²), sin base ACM.`;
    const lineasLuz = doc.splitTextToSize(textoLuz, 170);
    doc.text(lineasLuz, 20, y + 11);
    doc.text(
      `Para el área de ${formatearNumero(calculos.areaTotal)} ft² se requieren aproximadamente ${info.costosLED.cantidadTransformadores} transformador(es).`,
      20,
      y + 11 + (lineasLuz.length * 4)
    );
    y += 28;
  }

  if (info.esLetrasReforzadas) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(209, 236, 241);
    doc.setDrawColor(190, 229, 235);
    doc.rect(15, y, 180, 15, 'FD');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(12, 84, 96);
    doc.text('LETRAS REFORZADAS DE ALUCOBOND ACM CON LUZ', 20, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('No requiere base ACM adicional, ya que el mismo cuerpo funciona como soporte.', 20, y + 11);
    y += 18;
  }

  if (info.condicional) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(209, 236, 241);
    doc.setDrawColor(190, 229, 235);
    doc.rect(15, y, 180, 15, 'FD');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(12, 84, 96);
    doc.text('CONDICIONALES APLICADAS', 20, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const lineasCondicional = doc.splitTextToSize(info.condicional, 170);
    doc.text(lineasCondicional, 20, y + 11);
    y += 15;
  }

  // PIE DE PÁGINA
  doc.setTextColor(...colorSecundario);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  const altoPagina = 279; // Altura de página Letter en mm
  doc.line(15, altoPagina - 20, 195, altoPagina - 20);
  doc.text('Este documento es una cotización no vinculante.', 105, altoPagina - 16, { align: 'center' });
  doc.text('Los precios están sujetos a cambios sin previo aviso.', 105, altoPagina - 12, { align: 'center' });
  doc.text(`Generado el ${new Date().toLocaleString('es-PA')}`, 105, altoPagina - 8, { align: 'center' });

  // Generar nombre de archivo
  const timestamp = new Date().toISOString().slice(0, 10);
  const categoria = entrada.servicio['CATEGORIA'].replace(/[^a-z0-9]/gi, '_');
  const nombreArchivo = `Cotizacion_${categoria}_${timestamp}.pdf`;

  // Descargar el PDF
  doc.save(nombreArchivo);
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
