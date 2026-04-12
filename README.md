# Sistema Inmobiliario - Backend

Backend API para el sistema ERP inmobiliario construido con Node.js y PostgreSQL.

## Tecnologías

- **Node.js** - Runtime
- **Express** - Framework web
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **bcrypt** - Encriptación de contraseñas

## Endpoints

### Autenticación
- `POST /users/login` - Iniciar sesión

### Usuarios
- `GET /users` - Obtener todos los usuarios
- `POST /users` - Crear usuario
- `PUT /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario
- `GET /users/:id/permisos` - Obtener permisos de usuario

### Terrenos
- `GET /api/terrenos` - Obtener todos los terrenos
- `POST /api/terrenos` - Crear terreno
- `PUT /api/terrenos/:id` - Actualizar terreno
- `DELETE /api/terrenos/:id` - Eliminar terreno

### Sistema
- `GET /` - Verificar conexión a base de datos
- `GET /protected` - Ruta protegida (requiere token)

## Variables de Entorno

```env
# Ver .env.example para configuración
DB_HOST=your-host
DB_USER=your-user
DB_PASSWORD=your-password
DB_NAME=your-database
```

## Instalación

```bash
npm install
npm start
```

## Despliegue

Este proyecto está configurado para desplegarse automáticamente en Render usando el archivo `render.yaml`.

## Base de Datos

El sistema utiliza PostgreSQL con las siguientes tablas principales:
- `usuarios` - Usuarios del sistema
- `permisos` - Permisos por módulo
- `terrenos` - Datos de terrenos

## Seguridad

- Autenticación mediante JWT
- Contraseñas encriptadas con bcrypt
- CORS configurado para desarrollo
- Sistema de permisos por módulo

## Licencia

ISC
