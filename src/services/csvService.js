/**
 * Servicio para manejar la carga y procesamiento del archivo CSV
 */

export const cargarCSV = async (rutaArchivo) => {
  try {
    const response = await fetch(rutaArchivo);
    if (!response.ok) {
      throw new Error('No se pudo cargar el archivo CSV');
    }
    const texto = await response.text();
    return parsearCSV(texto);
  } catch (error) {
    console.error('Error al cargar CSV:', error);
    throw error;
  }
};

/**
 * Parsear el contenido del CSV a objetos JavaScript
 */
export const parsearCSV = (texto) => {
  const lineas = texto.split('\n');
  const encabezados = lineas[0]
    .split(';')
    .map(h => h.trim().replace(/^\uFEFF/, '')); // Remover BOM

  const datos = [];

  for (let i = 1; i < lineas.length; i++) {
    if (!lineas[i].trim()) continue;

    const valores = lineas[i].split(';');
    if (valores.length < encabezados.length) continue;

    const fila = {};
    encabezados.forEach((encabezado, index) => {
      fila[encabezado] = valores[index] ? valores[index].trim() : '';
    });

    // Solo agregar filas con tipo de servicio válido
    if (fila['TIPO DE SERVICIO']) {
      datos.push(fila);
    }
  }

  return datos;
};

/**
 * Obtener tipos de servicio únicos
 */
export const obtenerTiposServicio = (datos) => {
  return [...new Set(datos.map(s => s['TIPO DE SERVICIO']))];
};

/**
 * Obtener categorías por tipo de servicio
 */
export const obtenerCategoriasPorTipo = (datos, tipoServicio) => {
  return [...new Set(
    datos
      .filter(s => s['TIPO DE SERVICIO'] === tipoServicio)
      .map(s => s['CATEGORIA'])
  )];
};

/**
 * Obtener servicios por tipo y categoría
 */
export const obtenerServiciosPorTipoCategoria = (datos, tipoServicio, categoria) => {
  return datos.filter(
    s => s['TIPO DE SERVICIO'] === tipoServicio && s['CATEGORIA'] === categoria
  );
};

/**
 * Parsear precio del CSV (formato: $ 40,00)
 */
export const parsearPrecio = (precioStr) => {
  if (!precioStr) return 0;
  return parseFloat(
    precioStr
      .replace('$', '')
      .replace(',', '.')
      .replace(/\s/g, '')
      .trim()
  );
};
