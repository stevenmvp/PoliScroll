# Autenticación con Cognito y roles por entorno

## Objetivo

Garantizar que el acceso a la plataforma dependa de una sesión autenticada y validada en Amazon Cognito, evitando que cualquier usuario pueda navegar libremente por módulos protegidos.

## Política de trabajo

- no se usan credenciales locales como base final
- todo valor sensible se configura en AWS Amplify y Cognito
- el repositorio solo tendrá .env.example como referencia
- cada entorno tiene su propia configuración

## Arquitectura sugerida

### Frontend
- la app web obtiene sesión y tokens desde Cognito
- se valida si el usuario está logueado antes de mostrar módulos
- los roles se obtienen desde grupos o claims del token

### Backend
- valida token JWT emitido por Cognito
- asegura que el rol corresponda a la ruta a la que intenta entrar
- bloquea acceso si no tiene permisos

### AWS
- Cognito User Pool para usuarios y roles
- Cognito groups para admin / profesor / estudiante
- Amplify para despliegue del frontend

## Reglas de acceso

- usuarios no autenticados: acceso limitado a landing y login
- estudiantes: acceso a actividades, progreso y feedback
- profesores: acceso a aulas, grupos y creación de contenido
- administradores: acceso a métricas, usuarios y configuración global

## Variables esperadas

- NEXT_PUBLIC_COGNITO_REGION
- NEXT_PUBLIC_COGNITO_USER_POOL_ID
- NEXT_PUBLIC_COGNITO_CLIENT_ID
- NEXT_PUBLIC_COGNITO_DOMAIN
- NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN
- NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_OUT

## Recomendación de implementación

- manejar el state de sesión en el frontend mediante datos de Cognito
- aplicar rutas protegidas con middleware / guard
- centralizar reglas de permisos por rol
- sincronizar roles con backend para validación real

## Resultado esperado

Una app segura, con acceso por sesión real, sin secretos en código y con configuración gestionada por AWS.
