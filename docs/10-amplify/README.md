# Montaje incremental en AWS Amplify

## Objetivo

Desplegar la aplicación web desde el repositorio sin depender de configuración local, manteniendo variables, credenciales y conexiones administradas por AWS.

## Configuración del repositorio

La configuración está en `amplify.yml`. El frontend vive en `apps/web`, por lo que Amplify debe usar esa carpeta como `appRoot`.

Build esperado:

1. `npm ci`
2. `npm run build`
3. publicar `.next`

## Entornos

Se crearán ramas y entornos separados:

- `develop`: desarrollo compartido
- `staging`: validación antes de piloto
- `main`: producción, cuando exista aprobación

Cada entorno tendrá sus propias variables. No se copiarán valores sensibles entre entornos sin revisión.

## Variables públicas del frontend

Configurar en Amplify Environment variables:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_COGNITO_REGION`
- `NEXT_PUBLIC_COGNITO_USER_POOL_ID`
- `NEXT_PUBLIC_COGNITO_CLIENT_ID`
- `NEXT_PUBLIC_COGNITO_DOMAIN`
- `NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN`
- `NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_OUT`
- `NEXT_PUBLIC_COGNITO_RESPONSE_TYPE`
- `NEXT_PUBLIC_ENABLE_PWA`

Los valores `NEXT_PUBLIC_*` son visibles en el navegador. Nunca deben contener secretos.

## Variables privadas de backend

Estas variables deben vivir solamente en el servicio backend correspondiente o en AWS Secrets Manager / Systems Manager Parameter Store:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `AI_API_KEY`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `COGNITO_CLIENT_SECRET`

No se deben agregar como variables públicas de Amplify.

## Conexiones por fases

### Fase A: frontend aislado

- Amplify despliega `apps/web`
- Cognito todavía puede estar pendiente
- la app muestra estado de configuración si faltan variables

### Fase B: Cognito

- crear User Pool
- crear App Client
- crear grupos `admin`, `profesor`, `estudiante`
- configurar callback y logout por entorno
- registrar variables públicas en Amplify

### Fase C: API

- desplegar la API en un servicio independiente
- configurar `NEXT_PUBLIC_API_BASE_URL`
- validar tokens Cognito en backend
- probar `/health` y `/me`

### Fase D: datos y tiempo real

- RDS PostgreSQL
- ElastiCache Redis
- WebSocket gateway o servicio realtime
- secretos fuera del repositorio

## Reglas de despliegue

- todo pull request debe pasar build
- staging se valida antes de producción
- no se usan secretos en commits
- no se cambian URLs en código para corregir ambientes
- los cambios de conexión se hacen en variables del entorno
- se conserva evidencia del build y del smoke test

## Smoke test mínimo

Después de cada despliegue:

1. abrir la URL de Amplify
2. comprobar que carga la app
3. comprobar manifest y service worker
4. comprobar login y logout de Cognito
5. comprobar que una ruta protegida bloquea usuarios no autenticados
6. comprobar `/health` y la conexión frontend-API cuando exista

## Nota sobre el backend

Amplify hospedará inicialmente el frontend. La API, base de datos, Redis y tiempo real deben desplegarse como servicios separados y conectarse por variables del entorno. Esto evita acoplar el build web a infraestructura que todavía está en construcción.
