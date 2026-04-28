-- Dar permisos al usuario prueba
INSERT INTO permisos (usuario_id, modulo, acceso) VALUES
(3, 'terrenos', true),
(3, 'usuarios', true)
ON CONFLICT (usuario_id, modulo) DO UPDATE SET acceso = EXCLUDED.acceso;

-- Verificar que se asignaron correctamente
SELECT u.id, u.nombre, u.username, p.modulo, p.acceso
FROM usuarios u
JOIN permisos p ON u.id = p.usuario_id
WHERE u.username = 'prueba';
