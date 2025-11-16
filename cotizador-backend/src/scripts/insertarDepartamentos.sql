-- Insertar departamentos iniciales para el sistema de tickets
-- Basado en los departamentos visibles en las imágenes del sistema actual

USE cotizador_db;

INSERT INTO departamentos (nombre, descripcion, activo, createdAt, updatedAt) VALUES
('DISEÑO 1', 'Departamento de diseño gráfico y arte - Equipo 1', true, NOW(), NOW()),
('DISEÑO 2', 'Departamento de diseño gráfico y arte - Equipo 2', true, NOW(), NOW()),
('IMPRESIÓN 1', 'Departamento de impresión y producción - Equipo 1', true, NOW(), NOW()),
('IMPRESIÓN 2', 'Departamento de impresión y producción - Equipo 2', true, NOW(), NOW()),
('VENTAS', 'Departamento de ventas y atención al cliente', true, NOW(), NOW());
