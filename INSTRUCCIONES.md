# 🚀 Guía Rápida de Inicio

## ⚡ Inicio Rápido (3 pasos)

### 1. Abrir Terminal en la Carpeta del Proyecto
```bash
cd "c:\Users\USER\Documents\aranda\programa 2.3\cotizador-app"
```

### 2. Instalar Dependencias (solo la primera vez)
```bash
npm install
```

### 3. Iniciar la Aplicación
```bash
npm start
```

La aplicación se abrirá automáticamente en: **http://localhost:3000**

---

## 📊 Lo que Entendí del CSV

### Estructura de Datos
El CSV contiene **53 servicios** organizados en:

1. **LETRAS FORMADAS** (19 servicios)
   - Acrílico con/sin luz (diferentes espesores: 3mm, 4mm, 4.5mm, 6mm)
   - Acero inoxidable rayado/espejo con/sin luz
   - Alucobond (ACM) con/sin luz

2. **LETRAS RECORTADAS** (16 servicios)
   - PVC Espumoso (9 espesores: 2mm a 25mm)
   - Alucobond (ACM) 4mm
   - Acrílico (4 espesores)
   - Acrílico con Acero Inoxidable (2 espesores)

3. **IMPRESIÓN DIGITAL** (9 servicios)
   - Vinil adhesivo, Microperforado, Transparente
   - Laminado UV, Banner, Mesh, Black-out
   - Papel fotográfico, Backlight

4. **ROTULACIÓN DE VIDRIERA** (5 servicios)
   - Vinil impreso, Microperforado, Vinil de corte
   - Esmerilado de corte/impreso

5. **ROTULACIÓN DE VEHÍCULOS** (3 servicios)
   - Vinil impreso, Vinil de corte, Microperforado

---

## 🧮 Reglas de Cálculo Implementadas

### REGLA 1: Precio Mínimo para Letras Formadas con Luz
```
CONDICIONAL: "SI AREA TOTAL DE PIES2 ≤ A 3 PIE2 REDONDIAR EL TOTAL DEL CALCULO 50,00"

Aplicable a:
- ACRILICO CON LUZ DIRECTA
- ACRILICO CON LUZ INDIRECTA
- ACERO INOXIDABLE RAYADO CON LUZ
- ACERO INOXIDABLE ESPEJO CON LUZ

Lógica:
IF (areaTotal <= 3 ft²) THEN
    precioFinal = $50.00
ELSE
    precioFinal = precioPorFt2 * areaTotal
END IF
```

**Ejemplo:**
- Dimensiones: 1.5 ft × 1.5 ft = 2.25 ft²
- Precio por ft²: $44.00
- Cálculo normal: $44 × 2.25 = $99.00
- **Precio aplicado: $50.00** (por regla de mínimo)

---

### REGLA 2: Estructura Reforzada para Alucobond con Luz
```
CONDICIONAL: "SI EL AREA TOTAL EN PIE2 ES MAYOR A 3 PIE3, SUMAR UNA ESTRUCTURA INTERNA REFORZADA EQUIVALENTE A UN 10% DE COSTO TOTAL"

Aplicable a:
- ALUCOBOND (ACM) CON LUZ

Lógica:
IF (areaTotal > 3 ft²) THEN
    precioFinal = precioBase * 1.10  // +10%
ELSE
    precioFinal = precioBase
END IF
```

**Ejemplo:**
- Dimensiones: 2 ft × 2 ft = 4 ft²
- Precio por ft²: $15.00
- Precio base: $15 × 4 = $60.00
- **Precio con refuerzo: $60 × 1.10 = $66.00**

---

### REGLA 3: Color Personalizado (Letras Recortadas)
```
RECARGO: +$2.00 por ft² (solo si usuario marca la opción)

Aplicable a:
- Todos los servicios de LETRAS RECORTADAS

Lógica:
IF (tipoServicio == "LETRAS RECORTADAS" AND colorPersonalizado == TRUE) THEN
    recargoColor = 2.00 * areaTotal
    subtotal = precioBase + recargoColor
END IF
```

**Ejemplo:**
- PVC Espumoso 5mm: $26.00/ft²
- Área: 3 ft²
- Precio base: $26 × 3 = $78.00
- **Recargo color: $2 × 3 = $6.00**
- **Subtotal: $84.00**

---

### REGLA 4: ITBMS (Impuesto)
```
IMPUESTO: 7% sobre subtotal (opcional)

Aplicable a: TODOS LOS SERVICIOS

Lógica:
IF (aplicarITBMS == TRUE) THEN
    itbms = subtotal * 0.07
    total = subtotal + itbms
ELSE
    total = subtotal
END IF
```

**Ejemplo:**
- Subtotal: $100.00
- ITBMS (7%): $7.00
- **Total: $107.00**

---

### REGLA 5: Servicios con Luz
```
NOTA: Incluye pastillas LED y transformador (ya incluido en precio)

Aplicable cuando: CON LUZ = "SI"

Información adicional:
- Pastillas LED: B/. 1.25 c/u
- Transformador: B/. 34.95 (rinde 15 ft²)
- Sin base ACM

Cálculo de transformadores necesarios:
transformadores = CEILING(areaTotal / 15)
```

**Ejemplo:**
- Área: 20 ft²
- Transformadores necesarios: CEILING(20 / 15) = 2
- Costo referencial: 2 × $34.95 = $69.90 (informativo)

---

### REGLA 6: Letras Reforzadas Alucobond ACM con Luz
```
NOTA: No requiere base ACM adicional

El mismo cuerpo funciona como soporte estructural
```

---

### REGLA 7: Tamaño Mínimo
```
VALIDACIÓN: 1.5 ft² mínimo

Aplicable a: TODOS LOS SERVICIOS

Lógica:
IF (areaTotal < 1.5 ft²) THEN
    MOSTRAR WARNING
    CONTINUAR con cálculo
END IF
```

---

## 📐 Métodos de Cálculo

### Método 1: Por Área Total (Todos los servicios)
```
⚠️ IMPORTANTE: Este método calcula el precio de UNA SOLA UNIDAD completa

1. Convertir dimensiones a pies
2. Calcular área: alto × ancho
3. Área total = área (sin multiplicar por cantidad)
4. Precio base = área × precio por ft²
5. Aplicar condicionales
6. Agregar opcionales (color, ITBMS)
```

**Ejemplo:**
- Servicio: PVC Espumoso 5mm ($26/ft²)
- Dimensiones: 100 cm × 50 cm (1 unidad)
- Convertir: 3.28 ft × 1.64 ft = 5.38 ft²
- Precio: $26 × 5.38 = **$139.88**
- ⚠️ No se multiplica por cantidad (es 1 unidad completa)

---

### Método 2: Por Tamaño de Letra (Solo Letras Formadas/Recortadas)
```
⚠️ IMPORTANTE: Este método SÍ multiplica por la cantidad de letras

1. Calcular área de UNA letra
2. Multiplicar por cantidad de letras
3. Aplicar precio según área total
4. Considerar condicionales sobre área total
```

**Ejemplo:**
- Servicio: Acrílico con Luz Directa 4.5mm ($44/ft²)
- Tamaño por letra: 1 ft × 1 ft = 1 ft²
- Cantidad: 5 letras
- Área total: 5 × 1 = 5 ft²
- Precio: $44 × 5 = $220.00
- (No aplica mínimo porque área > 3 ft²)

---

## 🔍 Diferencia entre Métodos

| Aspecto | Método 1: Por Área Total | Método 2: Por Tamaño de Letra |
|---------|-------------------------|------------------------------|
| **Usa cantidad** | ❌ NO (siempre 1 unidad) | ✅ SÍ (cantidad de letras) |
| **Para qué sirve** | Calcular un rótulo/pieza completa | Calcular letras individuales |
| **Área total** | Alto × Ancho de la pieza | Alto × Ancho × Cantidad letras |
| **Campo cantidad** | No se muestra | Sí se muestra |
| **Ejemplo** | Un letrero de 4×10 ft | 6 letras de 1×1 ft c/u |

---

## 🔄 Conversión de Unidades

```javascript
// Pies (ft) - Base
1 ft = 1 ft

// Pulgadas (in) a Pies
1 in = 1/12 ft = 0.0833 ft
12 in = 1 ft

// Centímetros (cm) a Pies
1 cm = 0.0328 ft
30.48 cm = 1 ft

// Metros (m) a Pies
1 m = 3.28084 ft
```

**Ejemplos:**
- 24 in × 12 in = 2 ft × 1 ft = 2 ft²
- 60 cm × 30 cm = 1.97 ft × 0.98 ft = 1.93 ft²
- 2 m × 1 m = 6.56 ft × 3.28 ft = 21.52 ft²

---

## 💡 Ejemplos Completos de Cálculo

### Ejemplo 1: Letras Formadas Pequeñas con Luz

**Entrada:**
- Servicio: ACRILICO CON LUZ DIRECTA, 4.5mm
- Precio: $44.00/ft²
- Dimensiones: 1.5 ft × 1.5 ft
- Cantidad: 1
- ITBMS: Sí

**Cálculo:**
```
1. Área = 1.5 × 1.5 = 2.25 ft²
2. Precio normal = $44 × 2.25 = $99.00
3. ⚠️ CONDICIONAL: Área ≤ 3 ft² → Precio = $50.00
4. Subtotal = $50.00
5. ITBMS (7%) = $3.50
6. TOTAL = $53.50
```

**Notas:**
- ✓ Incluye pastillas LED
- ✓ Incluye transformador (rinde 15 ft²)
- ✓ Sin base ACM

---

### Ejemplo 2: Letras Recortadas con Color Personalizado

**Entrada:**
- Servicio: PVC ESPUMOSO, 5mm
- Precio: $26.00/ft²
- Dimensiones: 2 ft × 1.5 ft
- Cantidad: 1
- Color personalizado: Sí
- ITBMS: Sí

**Cálculo:**
```
1. Área = 2 × 1.5 = 3 ft²
2. Precio base = $26 × 3 = $78.00
3. Recargo color = $2 × 3 = $6.00
4. Subtotal = $78 + $6 = $84.00
5. ITBMS (7%) = $5.88
6. TOTAL = $89.88
```

---

### Ejemplo 3: Alucobond Grande con Estructura Reforzada

**Entrada:**
- Servicio: ALUCOBOND (ACM) CON LUZ
- Precio: $15.00/ft²
- Dimensiones: 3 ft × 2 ft
- Cantidad: 1
- ITBMS: No

**Cálculo:**
```
1. Área = 3 × 2 = 6 ft²
2. Precio base = $15 × 6 = $90.00
3. ⚠️ CONDICIONAL: Área > 3 ft² → +10% refuerzo
4. Precio con refuerzo = $90 × 1.10 = $99.00
5. Subtotal = $99.00
6. TOTAL = $99.00
```

**Notas:**
- ✓ Incluye pastillas LED
- ✓ Estructura reforzada incluida
- ✓ No requiere base ACM adicional

---

### Ejemplo 4: Por Tamaño de Letra

**Entrada:**
- Servicio: ACRILICO SIN LUZ, 4mm
- Precio: $27.00/ft²
- Método: Por tamaño de letra
- Tamaño letra: 8 in × 6 in
- Cantidad: 10 letras
- ITBMS: Sí

**Cálculo:**
```
1. Convertir: 8 in = 0.667 ft, 6 in = 0.5 ft
2. Área por letra = 0.667 × 0.5 = 0.33 ft²
3. Área total = 0.33 × 10 = 3.33 ft²
4. Precio base = $27 × 3.33 = $90.00
5. Subtotal = $90.00
6. ITBMS (7%) = $6.30
7. TOTAL = $96.30
```

---

## 🎯 Plan de Implementación Futuro

### Fase 1 (Actual) ✅
- ✅ Carga automática del CSV
- ✅ Formulario dinámico
- ✅ Cálculos con todas las reglas del CSV
- ✅ Conversión de unidades
- ✅ Validaciones
- ✅ Exportación/Impresión

### Fase 2 (Futuro) 🔮
- 📱 Versión móvil nativa (React Native)
- 💾 Guardar cotizaciones en base de datos
- 📧 Enviar cotizaciones por email
- 📊 Dashboard de estadísticas
- 👥 Sistema multi-usuario
- 🔐 Login/Autenticación

### Fase 3 (Futuro) 🚀
- 🤖 Recomendaciones automáticas de servicios
- 📸 Subir fotos del proyecto
- 📅 Gestión de proyectos completos
- 💬 Chat con clientes
- 📈 Reportes y analytics avanzados
- 🔄 Integración con sistema de inventario

---

## 🛠️ Comandos Útiles

```bash
# Iniciar en modo desarrollo
npm start

# Crear build de producción
npm run build

# Ejecutar tests
npm test

# Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm install

# Ver estructura del proyecto
tree /F
```

---

## 📞 Soporte

Si tienes problemas:
1. Revisar este archivo
2. Consultar README.md
3. Revisar console del navegador (F12)
4. Contactar al equipo de desarrollo

---

**¡Listo para cotizar!** 🎉
