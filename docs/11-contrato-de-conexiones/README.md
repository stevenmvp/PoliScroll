# Contrato de conexiones entre servicios

## Frontend web

Ubicación: `apps/web`

Responsabilidades:

- renderizar la experiencia PWA
- consumir la API mediante `NEXT_PUBLIC_API_BASE_URL`
- iniciar autenticación Cognito
- guardar únicamente datos no sensibles en almacenamiento local

## Cognito

Responsabilidades:

- registro e inicio de sesión
- recuperación de cuenta
- emisión y renovación de tokens
- grupos y claims de rol

Grupos iniciales:

- `admin`
- `profesor`
- `estudiante`

## API

Responsabilidades:

- validar el JWT de Cognito
- resolver permisos de negocio
- no confiar en el rol enviado por el cliente
- exponer datos de usuarios, aulas, actividades y sesiones

Endpoints iniciales:

- `GET /health`
- `GET /me`
- `GET /admin/dashboard`
- `GET /profesor/dashboard`
- `GET /estudiante/dashboard`

## Persistencia

- PostgreSQL: usuarios de negocio, aulas, contenido, intentos y progreso
- Redis: sesiones activas, ranking y presencia temporal
- S3: recursos multimedia y archivos de actividades

## Regla de seguridad

El frontend puede ocultar módulos por experiencia, pero la autorización verdadera debe ejecutarse en la API usando el token validado de Cognito y permisos del servidor.

## Regla de disponibilidad

Si la API no responde:

- la app conserva la shell PWA
- muestra estado de conexión
- permite revisar datos previamente sincronizados
- encola operaciones permitidas para sincronización posterior
- no inventa resultados ni confirma operaciones no recibidas por el servidor
