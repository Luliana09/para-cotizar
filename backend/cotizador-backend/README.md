# Backend - Sistema de Cotización

Backend API REST desarrollado con Node.js, Express, Sequelize y MySQL para el sistema de cotización de servicios.

## 📋 Características

- ✅ API REST completa con Express
- ✅ Autenticación JWT
- ✅ Base de datos MySQL con Sequelize ORM
- ✅ Migraciones de base de datos
- ✅ Sistema de roles (admin, vendedor, visualizador)
- ✅ CRUD completo de clientes
- ✅ CRUD completo de cotizaciones
- ✅ Generación automática de números de cotización (COT-YYYY-NNNN)
- ✅ Validaciones y manejo de errores
- ✅ CORS configurado para React frontend

## 🚀 Inicio Rápido

### 1. Asegúrate de que XAMPP esté corriendo

```bash
# Iniciar MySQL en XAMPP
# Puerto: 3306
# Usuario: root
# Sin contraseña
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Ya existe un archivo `.env` configurado con:

```env
PORT=5000
NODE_ENV=development

# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cotizador_db
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura_aqui_2024

# CORS
FRONTEND_URL=http://localhost:3000
```

### 4. Crear Base de Datos y Tablas

```bash
# Crear base de datos
npx sequelize-cli db:create

# Ejecutar migraciones (crear tablas)
npx sequelize-cli db:migrate

# Crear usuario administrador inicial
npx sequelize-cli db:seed:all
```

### 5. Iniciar Servidor

```bash
npm start
```

El servidor estará corriendo en: **http://localhost:5000**

## 👤 Usuario Administrador Inicial

Después de ejecutar las migraciones y seeders:

```
Email: admin@cotizador.com
Password: admin123
```

⚠️ **IMPORTANTE**: Cambia esta contraseña en producción

## 📡 API Endpoints

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login de usuario | No |
| GET | `/api/auth/me` | Obtener usuario actual | Sí |
| PUT | `/api/auth/cambiar-password` | Cambiar contraseña | Sí |
| POST | `/api/auth/register` | Registrar nuevo usuario | Sí (Admin) |

### Clientes

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/clientes` | Listar todos los clientes | Sí |
| GET | `/api/clientes/:id` | Obtener cliente por ID | Sí |
| POST | `/api/clientes` | Crear nuevo cliente | Sí |
| PUT | `/api/clientes/:id` | Actualizar cliente | Sí |
| DELETE | `/api/clientes/:id` | Desactivar cliente | Sí (Admin) |

### Cotizaciones

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/cotizaciones` | Listar todas las cotizaciones | Sí |
| GET | `/api/cotizaciones/:id` | Obtener cotización por ID | Sí |
| POST | `/api/cotizaciones` | Crear nueva cotización | Sí |
| PUT | `/api/cotizaciones/:id` | Actualizar cotización | Sí |
| PATCH | `/api/cotizaciones/:id/estado` | Cambiar estado | Sí |
| DELETE | `/api/cotizaciones/:id` | Eliminar cotización | Sí (Admin) |
| GET | `/api/cotizaciones/stats/resumen` | Obtener estadísticas | Sí |

### Health Check

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Info del API | No |
| GET | `/health` | Estado del servidor y BD | No |

## 🔐 Autenticación

Todas las rutas protegidas requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

### Ejemplo de Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cotizador.com",
    "password": "admin123"
  }'
```

Respuesta:

```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "nombre": "Administrador",
      "email": "admin@cotizador.com",
      "rol": "admin"
    }
  }
}
```

### Ejemplo de Petición Autenticada

```bash
curl -X GET http://localhost:5000/api/clientes \
  -H "Authorization: Bearer <tu_token_aqui>"
```

## 📊 Estructura de la Base de Datos

### Tabla: usuarios

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | ID único (PK) |
| nombre | VARCHAR(100) | Nombre del usuario |
| email | VARCHAR(100) | Email (único) |
| password | VARCHAR(255) | Password hasheado |
| rol | ENUM | admin, vendedor, visualizador |
| activo | BOOLEAN | Usuario activo/inactivo |

### Tabla: clientes

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | ID único (PK) |
| nombre | VARCHAR(150) | Nombre del cliente |
| ruc | VARCHAR(20) | RUC (único, opcional) |
| cedula | VARCHAR(20) | Cédula (único, opcional) |
| email | VARCHAR(100) | Email del cliente |
| telefono | VARCHAR(20) | Teléfono fijo |
| celular | VARCHAR(20) | Celular |
| direccion | TEXT | Dirección completa |
| notas | TEXT | Notas adicionales |
| activo | BOOLEAN | Cliente activo/inactivo |

### Tabla: cotizaciones

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | ID único (PK) |
| numero_cotizacion | VARCHAR(50) | COT-YYYY-NNNN (único) |
| usuario_id | INTEGER | FK a usuarios |
| cliente_id | INTEGER | FK a clientes |
| tipo_servicio | VARCHAR(100) | Tipo de servicio |
| categoria | VARCHAR(100) | Categoría del servicio |
| espesor | VARCHAR(50) | Espesor del material |
| precio_por_ft2 | DECIMAL(10,2) | Precio por pie cuadrado |
| con_luz | BOOLEAN | Incluye luz LED |
| metodo_calculo | ENUM | area, letra |
| alto | DECIMAL(10,2) | Alto en unidad especificada |
| ancho | DECIMAL(10,2) | Ancho en unidad especificada |
| unidad | ENUM | ft, in, cm, m |
| cantidad | INTEGER | Cantidad de unidades/letras |
| area_unitaria | DECIMAL(10,4) | Área de una unidad |
| area_total | DECIMAL(10,4) | Área total |
| precio_base | DECIMAL(10,2) | Precio base |
| recargo_color | DECIMAL(10,2) | Recargo por color |
| color_personalizado | BOOLEAN | Tiene color personalizado |
| subtotal | DECIMAL(10,2) | Subtotal |
| itbms | DECIMAL(10,2) | Impuesto ITBMS (7%) |
| aplicar_itbms | BOOLEAN | Aplicar impuesto |
| total | DECIMAL(10,2) | Total final |
| estado | ENUM | borrador, enviada, aprobada, rechazada, vencida |
| fecha_envio | DATE | Fecha de envío al cliente |
| fecha_aprobacion | DATE | Fecha de aprobación |
| fecha_vencimiento | DATE | Fecha de vencimiento |
| notas | TEXT | Notas adicionales |
| datos_calculo_json | JSON | Datos completos del cálculo |

## 🔄 Comandos de Sequelize CLI

```bash
# Crear migración
npx sequelize-cli migration:generate --name nombre-migracion

# Ejecutar migraciones
npx sequelize-cli db:migrate

# Revertir última migración
npx sequelize-cli db:migrate:undo

# Revertir todas las migraciones
npx sequelize-cli db:migrate:undo:all

# Ejecutar seeders
npx sequelize-cli db:seed:all

# Revertir seeders
npx sequelize-cli db:seed:undo:all
```

## 🛠️ Scripts Disponibles

```bash
# Iniciar servidor en modo desarrollo
npm start

# Iniciar con nodemon (reinicio automático)
npm run dev

# Crear base de datos
npm run db:create

# Ejecutar migraciones
npm run db:migrate

# Ejecutar seeders
npm run db:seed
```

## 📁 Estructura del Proyecto

```
cotizador-backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de Sequelize
│   ├── controllers/
│   │   ├── authController.js    # Lógica de autenticación
│   │   ├── clientesController.js # Lógica de clientes
│   │   └── cotizacionesController.js # Lógica de cotizaciones
│   ├── middleware/
│   │   └── authMiddleware.js    # Middleware de autenticación
│   ├── migrations/
│   │   ├── 20240101000001-create-usuarios.js
│   │   ├── 20240101000002-create-clientes.js
│   │   ├── 20240101000003-create-cotizaciones.js
│   │   └── 20240101000004-create-configuraciones.js
│   ├── models/
│   │   ├── index.js             # Configuración de modelos
│   │   ├── usuario.js           # Modelo Usuario
│   │   ├── cliente.js           # Modelo Cliente
│   │   ├── cotizacion.js        # Modelo Cotización
│   │   └── configuracion.js     # Modelo Configuración
│   ├── routes/
│   │   ├── auth.js              # Rutas de autenticación
│   │   ├── clientes.js          # Rutas de clientes
│   │   └── cotizaciones.js      # Rutas de cotizaciones
│   ├── seeders/
│   │   └── 20240101000001-admin-usuario.js
│   └── server.js                # Archivo principal del servidor
├── .env                         # Variables de entorno
├── .env.example                 # Ejemplo de variables
├── .sequelizerc                 # Configuración de Sequelize CLI
├── .gitignore
├── package.json
└── README.md
```

## 🔐 Roles y Permisos

### Admin
- Acceso completo a todas las funcionalidades
- Puede crear/editar/eliminar usuarios
- Puede eliminar clientes y cotizaciones

### Vendedor
- Puede crear y editar cotizaciones
- Puede crear y editar clientes
- Puede ver todas las cotizaciones

### Visualizador
- Solo puede ver cotizaciones y clientes
- Sin permisos de edición

## 🐛 Solución de Problemas

### Error: "Error: listen EADDRINUSE: address already in use"

El puerto 5000 ya está en uso. Mata el proceso:

```bash
# Windows
netstat -ano | findstr :5000
taskkill //PID <PID> //F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### Error: "ER_ACCESS_DENIED_ERROR: Access denied"

Verifica que MySQL esté corriendo en XAMPP y las credenciales en `.env` sean correctas.

### Error: "Unknown database 'cotizador_db'"

Ejecuta:

```bash
npx sequelize-cli db:create
```

## 📝 Próximos Pasos

- [ ] Integrar con React frontend
- [ ] Implementar envío de emails
- [ ] Agregar generación de PDF en backend
- [ ] Implementar envío por WhatsApp
- [ ] Agregar logs de auditoría
- [ ] Implementar pruebas unitarias
- [ ] Documentación con Swagger

## 🤝 Contribución

Este es un proyecto privado desarrollado para cotización de servicios.

## 📄 Licencia

Privado - Todos los derechos reservados

---

**¡Listo para usar!** 🎉

Para más información, consulta la documentación del frontend en `cotizador-app/`.
