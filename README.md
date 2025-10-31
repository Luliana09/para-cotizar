# 🏢 Sistema de Cotización de Servicios

Sistema profesional de cotización desarrollado con React que calcula precios de servicios basándose en reglas de negocio definidas en un archivo CSV.

## 📋 Características

### Core Features:
- ✅ **Carga automática de datos** desde archivo CSV
- ✅ **5 tipos de servicios:** Letras Formadas, Letras Recortadas, Impresión Digital, Rotulación de Vidriera, Rotulación de Vehículos
- ✅ **Dos métodos de cálculo** para letras (por área total o por tamaño de letra)
- ✅ **Conversión de unidades** (pies, pulgadas, centímetros, metros)
- ✅ **Aplicación automática de condicionales** del CSV
- ✅ **Opciones adicionales:** Color personalizado, ITBMS (7%)
- ✅ **Validaciones en tiempo real**
- ✅ **Interfaz responsive** (desktop, tablet, móvil)
- ✅ **Diseño moderno y profesional**

### 🆕 Nuevas Funcionalidades:
- ✅ **📊 Visualizador de CSV** - Estadísticas y análisis completo de servicios
- ✅ **📜 Historial de Cotizaciones** - Guarda automáticamente en LocalStorage
- ✅ **📄 Exportación Avanzada a PDF** - Documentos profesionales
- ✅ **🔍 Búsqueda y Filtrado** - Encuentra cotizaciones rápidamente
- ✅ **💾 Persistencia de Datos** - No pierdas tus cotizaciones
- ✅ **📈 Estadísticas de Uso** - Total acumulado y métricas

## 🎯 Reglas de Negocio del CSV

### Tipos de Servicio

1. **LETRAS FORMADAS**
   - Materiales: Acrílico, Acero Inoxidable, Alucobond (ACM)
   - Con/Sin luz
   - Múltiples espesores

2. **LETRAS RECORTADAS**
   - Materiales: PVC Espumoso, Alucobond, Acrílico
   - Opción de color personalizado (+$2.00/ft²)

3. **IMPRESIÓN DIGITAL**
   - Vinil, Microperforado, Transparente, Banner, etc.

4. **ROTULACIÓN DE VIDRIERA**
   - Vinil impreso, Microperforado, Esmerilado

5. **ROTULACIÓN DE VEHÍCULOS**
   - Vinil impreso, Microperforado

### Condicionales Automáticas

#### Letras Formadas con Luz
- **Si área ≤ 3 ft²**: Precio mínimo de $50.00
- **Si área ≥ 3 ft²**: Usar grosor de 4.5mm

#### Alucobond (ACM) con Luz
- **Si área > 3 ft²**: +10% por estructura reforzada

#### Servicios con Luz
- Incluye: Pastillas LED (B/. 1.25 c/u) + Transformador (B/. 34.95, rinde 15 ft²)
- Sin base ACM

#### Letras Recortadas
- Opción: Color personalizado = +$2.00/ft²

#### General
- Tamaño mínimo: 1.5 ft²
- ITBMS: 7% (opcional)

## 🚀 Instalación

### Prerrequisitos

- Node.js (versión 14 o superior)
- npm o yarn

### Pasos

1. **Navegar a la carpeta del proyecto:**
   ```bash
   cd cotizador-app
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Verificar que el archivo CSV esté en la carpeta public:**
   ```
   cotizador-app/
   └── public/
       └── 2 DATO PARA COTIZAR COPIA.csv
   ```

4. **Iniciar la aplicación:**
   ```bash
   npm start
   ```

5. **Abrir en el navegador:**
   ```
   http://localhost:3000
   ```

## 📁 Estructura del Proyecto

```
cotizador-app/
├── public/
│   ├── index.html
│   └── 2 DATO PARA COTIZAR COPIA.csv
├── src/
│   ├── components/
│   │   ├── FormularioCotizacion.jsx
│   │   ├── FormularioCotizacion.css
│   │   ├── ResultadosCotizacion.jsx
│   │   └── ResultadosCotizacion.css
│   ├── services/
│   │   ├── csvService.js          # Carga y parseo del CSV
│   │   └── calculoService.js      # Lógica de cálculos y condicionales
│   ├── utils/
│   │   └── conversiones.js        # Conversión de unidades
│   ├── App.js                     # Componente principal
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## 💻 Uso de la Aplicación

### 1. Seleccionar Servicio
- Elegir tipo de servicio (Letras Formadas, Letras Recortadas, etc.)
- Seleccionar categoría del servicio
- Elegir espesor si hay múltiples opciones

### 2. Método de Cálculo (solo para letras)
- **Por Área Total**: Calcula el precio basado en el área total
- **Por Tamaño de Letra**: Calcula el precio por cada letra individual

### 3. Ingresar Dimensiones
- Seleccionar unidad de medida (ft, in, cm, m)
- Ingresar alto y ancho
- Si es por letra, ingresar cantidad de letras

### 4. Opciones Adicionales
- **Color Personalizado**: +$2.00/ft² (solo letras recortadas)
- **ITBMS**: +7% sobre subtotal

### 5. Calcular y Exportar
- Click en "Calcular Cotización"
- Revisar desglose completo
- Exportar/Imprimir si es necesario

## 🔧 Servicios y Utilidades

### csvService.js
```javascript
- cargarCSV()                        // Carga el archivo CSV
- parsearCSV()                       // Parsea CSV a objetos JS
- obtenerTiposServicio()             // Obtiene tipos únicos
- obtenerCategoriasPorTipo()         // Filtra categorías
- obtenerServiciosPorTipoCategoria() // Filtra servicios
- parsearPrecio()                    // Parsea precios del CSV
```

### calculoService.js
```javascript
- calcularCotizacion()    // Función principal de cálculo
- validarDatos()          // Valida datos de entrada
- aplicarCondicionales()  // Aplica reglas del CSV
```

### conversiones.js
```javascript
- convertirAPies()        // Convierte unidades a pies
- calcularAreaPies2()     // Calcula área en ft²
- formatearMoneda()       // Formatea a moneda (B/.)
- formatearNumero()       // Formatea números decimales
```

## 📊 Ejemplo de Cálculo

### Entrada:
- Tipo: LETRAS FORMADAS
- Categoría: ACRILICO CON LUZ DIRECTA
- Espesor: 4.5 MM
- Dimensiones: 2 ft × 1.5 ft
- Cantidad: 1
- ITBMS: Sí

### Proceso:
1. Área = 2 × 1.5 = 3 ft²
2. Precio base = $44.00/ft² × 3 ft² = $132.00
3. **Condicional aplicada**: Área ≤ 3 ft² → Precio = $50.00
4. Subtotal = $50.00
5. ITBMS (7%) = $3.50
6. **Total = $53.50**

### Notas:
- Incluye pastillas LED y transformador
- Se requiere 1 transformador (rinde 15 ft²)

## 🎨 Personalización

### Modificar Estilos
Editar archivos CSS en:
- `src/App.css` - Estilos generales
- `src/components/FormularioCotizacion.css`
- `src/components/ResultadosCotizacion.css`

### Agregar Nuevas Reglas
Modificar `src/services/calculoService.js`:
```javascript
const aplicarCondicionales = (servicio, areaTotal, precioBase) => {
  // Agregar nuevas condicionales aquí
};
```

### Actualizar CSV
Reemplazar archivo en `public/2 DATO PARA COTIZAR COPIA.csv`

## 🚢 Deployment (Construcción para Producción)

```bash
npm run build
```

Esto crea una carpeta `build/` con la aplicación optimizada lista para producción.

### Opciones de Deployment:

1. **Netlify**: Arrastrar carpeta `build/`
2. **Vercel**: `vercel deploy`
3. **GitHub Pages**: Configurar en `package.json`
4. **Servidor propio**: Subir contenido de `build/`

## 📝 Notas Técnicas

- **React 18**: Usando las últimas características
- **Hooks**: useState, useEffect
- **CSS modular**: Componentes con estilos aislados
- **Responsive**: Mobile-first design
- **Performance**: Carga lazy de componentes
- **Accesibilidad**: Labels y ARIA attributes

## 🐛 Troubleshooting

### El CSV no carga
- Verificar que el archivo esté en `public/`
- Verificar nombre exacto del archivo
- Revisar console del navegador (F12)

### Errores de cálculo
- Revisar formato del CSV
- Verificar que los precios tengan formato correcto
- Revisar console para errores

### Estilos no se aplican
- Limpiar caché: `npm start` de nuevo
- Verificar imports de CSS
- Revisar DevTools del navegador

## 📄 Licencia

Este proyecto es de uso interno para cotización de servicios.

## 👨‍💻 Desarrollo

Desarrollado con:
- React 18
- CSS3
- JavaScript ES6+

---

**¿Preguntas o problemas?** Revisar la documentación o contactar al equipo de desarrollo.
