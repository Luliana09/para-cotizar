/**
 * Utilidades para conversión de unidades a pies cuadrados
 */

export const UNIDADES = {
  FT: 'ft',
  IN: 'in',
  CM: 'cm',
  M: 'm'
};

/**
 * Convertir diferentes unidades a pies
 */
export const convertirAPies = (valor, unidad) => {
  const conversiones = {
    [UNIDADES.FT]: (v) => v,
    [UNIDADES.IN]: (v) => v / 12,
    [UNIDADES.CM]: (v) => v / 30.48,
    [UNIDADES.M]: (v) => v * 3.28084
  };

  return conversiones[unidad] ? conversiones[unidad](valor) : valor;
};

/**
 * Calcular área en pies cuadrados
 */
export const calcularAreaPies2 = (alto, ancho, unidad) => {
  const altoPies = convertirAPies(alto, unidad);
  const anchoPies = convertirAPies(ancho, unidad);
  return altoPies * anchoPies;
};

/**
 * Formatear número a moneda
 */
export const formatearMoneda = (valor) => {
  return new Intl.NumberFormat('es-PA', {
    style: 'currency',
    currency: 'PAB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);
};

/**
 * Formatear número con decimales
 */
export const formatearNumero = (valor, decimales = 2) => {
  return Number(valor).toFixed(decimales);
};
