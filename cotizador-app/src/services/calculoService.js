/**
 * Servicio para realizar cálculos de cotización basados en las reglas del CSV
 */

import { calcularAreaPies2 } from '../utils/conversiones';
import { parsearPrecio } from './csvService';

/**
 * REGLAS DE NEGOCIO EXTRAÍDAS DEL CSV:
 *
 * 1. LETRAS FORMADAS CON LUZ (Acrílico, Acero Inoxidable):
 *    - Si área total <= 3 ft²: Redondear total a $50.00
 *    - Si área total >= 3 ft²: Usar grosor de 4.5mm (ya seleccionado en formulario)
 *
 * 2. LETRAS FORMADAS - ALUCOBOND CON LUZ:
 *    - Si área total > 3 ft²: Sumar 10% estructura reforzada
 *
 * 3. LETRAS RECORTADAS:
 *    - Opción: Color personalizado +$2.00 por ft²
 *
 * 4. CON LUZ = SI:
 *    - Incluye: Pastillas LED (B/. 1.25 c/u) + Transformador (B/. 34.95, rinde 15 ft²)
 *    - Sin base ACM
 *
 * 5. TAMAÑO MÍNIMO: 1.5 ft²
 *
 * 6. ITBMS: 7% opcional sobre subtotal
 */

/**
 * Aplicar condicionales según el servicio y área
 */
const aplicarCondicionales = (servicio, areaTotal, precioBase) => {
  const condicional = servicio['CONDICIONAL'];
  if (!condicional) return precioBase;

  let precioFinal = precioBase;

  // Regla 1: Redondear a $50 si área <= 3 ft²
  if (condicional.includes('≤ A 3 PIE2 REDONDIAR EL TOTAL DEL CALCULO 50,00')) {
    if (areaTotal <= 3) {
      return 50.00;
    }
  }

  // Regla 2: Estructura reforzada 10% si área > 3 ft² (ALUCOBOND CON LUZ)
  if (condicional.includes('SUMAR UNA ESTRUCTURA INTERNA REFORZADA EQUIVALENTE A UN 10%')) {
    if (areaTotal > 3) {
      precioFinal = precioBase * 1.10;
    }
  }

  return precioFinal;
};

/**
 * Calcular precio para método 1: Por área total
 */
const calcularPorArea = (servicio, areaTotal) => {
  const precioPorFt2 = parsearPrecio(servicio['PRECIO BASE EN PIE2']);
  let precioBase = precioPorFt2 * areaTotal;

  // Aplicar condicionales del CSV
  precioBase = aplicarCondicionales(servicio, areaTotal, precioBase);

  return { precioBase, precioPorFt2 };
};

/**
 * Calcular precio para método 2: Por tamaño de letra
 */
const calcularPorLetra = (servicio, areaUnitaria, cantidad) => {
  const precioPorFt2 = parsearPrecio(servicio['PRECIO BASE EN PIE2']);
  const areaTotal = areaUnitaria * cantidad;

  // El precio se calcula por letra individual
  let precioBase = precioPorFt2 * areaUnitaria * cantidad;

  // Aplicar condicionales considerando el área total
  precioBase = aplicarCondicionales(servicio, areaTotal, precioBase);

  return { precioBase, precioPorFt2, areaTotal };
};

/**
 * Calcular recargo por color personalizado
 * Solo aplica para LETRAS RECORTADAS
 */
const calcularRecargoColor = (servicio, areaTotal, colorPersonalizado) => {
  if (!colorPersonalizado) return 0;

  const tipoServicio = servicio['TIPO DE SERVICIO'];
  if (tipoServicio === 'LETRAS RECORTADAS') {
    return 2.00 * areaTotal;
  }

  return 0;
};

/**
 * Verificar tamaño mínimo
 */
const verificarTamañoMinimo = (servicio, areaTotal) => {
  const tamañoMinimo = parseFloat(servicio['TAMAÑO MINIMO EN PIE2'].replace(',', '.'));
  return {
    cumple: areaTotal >= tamañoMinimo,
    tamañoMinimo,
    diferencia: tamañoMinimo - areaTotal
  };
};

/**
 * Función principal de cálculo
 */
export const calcularCotizacion = (datos) => {
  const {
    servicio,
    alto,
    ancho,
    unidad,
    metodoCalculo,
    cantidad = 1,
    colorPersonalizado = false,
    aplicarITBMS = false
  } = datos;

  // Calcular área unitaria
  const areaUnitaria = calcularAreaPies2(alto, ancho, unidad);
  let areaTotal = areaUnitaria;

  // Verificar tamaño mínimo
  const validacionTamaño = verificarTamañoMinimo(servicio, areaUnitaria);

  let precioBase, precioPorFt2;

  // Calcular según método
  if (metodoCalculo === 'letra') {
    // Método 2: Por tamaño de letra - se multiplica por cantidad
    const resultado = calcularPorLetra(servicio, areaUnitaria, cantidad);
    precioBase = resultado.precioBase;
    precioPorFt2 = resultado.precioPorFt2;
    areaTotal = resultado.areaTotal;
  } else {
    // Método 1: Por área total - NO se multiplica por cantidad (es una sola unidad)
    areaTotal = areaUnitaria; // Solo el área de la unidad
    const resultado = calcularPorArea(servicio, areaTotal);
    precioBase = resultado.precioBase;
    precioPorFt2 = resultado.precioPorFt2;
  }

  // Calcular recargo por color personalizado
  const recargoColor = calcularRecargoColor(servicio, areaTotal, colorPersonalizado);

  // Calcular subtotal
  const subtotal = precioBase + recargoColor;

  // Calcular ITBMS (7%)
  const itbms = aplicarITBMS ? subtotal * 0.07 : 0;

  // Total final
  const total = subtotal + itbms;

  // Información adicional sobre el servicio
  const conLuz = servicio['CON LUZ'] === 'SI';
  const categoria = servicio['CATEGORIA'];
  const esLetrasReforzadas =
    categoria.includes('ALUCOBOND (ACM) CON LUZ') &&
    servicio['TIPO DE SERVICIO'] === 'LETRAS FORMADAS';

  // Calcular costos de LED (informativo, ya incluido en precio)
  let costosLED = null;
  if (conLuz) {
    const cantidadTransformadores = Math.ceil(areaTotal / 15);
    costosLED = {
      precioLED: 1.25,
      precioTransformador: 34.95,
      rendimientoTransformador: 15,
      cantidadTransformadores
    };
  }

  return {
    // Datos de entrada
    entrada: {
      servicio,
      alto,
      ancho,
      unidad,
      metodoCalculo,
      cantidad,
      colorPersonalizado,
      aplicarITBMS
    },
    // Cálculos
    calculos: {
      areaUnitaria,
      areaTotal,
      precioPorFt2,
      precioBase,
      recargoColor,
      subtotal,
      itbms,
      total
    },
    // Validaciones
    validaciones: {
      tamañoMinimo: validacionTamaño
    },
    // Información adicional
    info: {
      conLuz,
      esLetrasReforzadas,
      costosLED,
      instalacionIncluida: servicio['INSTALACION INCLUIDA'],
      condicional: servicio['CONDICIONAL']
    }
  };
};

/**
 * Validar datos de entrada antes de calcular
 */
export const validarDatos = (datos) => {
  const errores = [];

  if (!datos.servicio) {
    errores.push('Debe seleccionar un servicio');
  }

  if (!datos.alto || datos.alto <= 0) {
    errores.push('El alto debe ser mayor a 0');
  }

  if (!datos.ancho || datos.ancho <= 0) {
    errores.push('El ancho debe ser mayor a 0');
  }

  if (datos.metodoCalculo === 'letra' && (!datos.cantidad || datos.cantidad < 1)) {
    errores.push('La cantidad debe ser al menos 1');
  }

  return {
    valido: errores.length === 0,
    errores
  };
};
