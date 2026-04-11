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

```
DB_HOST=d7431l0gjchc73b1054g-a.oregon-postgres.render.com
DB_USER=cyt_database_user
DB_PASSWORD=qXJ3A9KUFWMeaPTFJXMzStAS8JRW7BiT
DB_NAME=cyt_database
DB_PORT=5432
DATABASE_URL=postgres://cyt_database_user:qXJ3A9KUFWMeaPTFJXMzStAS8JRW7BiT@dpg-d7431l0gjchc73b1054g-a.oregon-postgres.render.com:5432/cyt_database
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
