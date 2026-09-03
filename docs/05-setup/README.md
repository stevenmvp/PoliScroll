# Setup del entorno de trabajo

## Objetivo

Preparar un entorno de desarrollo estable para arrancar el proyecto sin problemas de configuración ni bloqueos técnicos.

## 1. Requisitos iniciales

- Node.js 18 o superior
- npm o pnpm o yarn
- Git
- VS Code
- Docker Desktop (recomendado para servicios locales)
- acceso a una cuenta de AWS para despliegues controlados

## 2. Extensiones recomendadas para VS Code

Se recomienda instalar las siguientes extensiones:

- GitHub Copilot
- GitHub Copilot Chat
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma
- Docker
- PostgreSQL
- GitLens
- Auto Rename Tag
- REST Client
- Thunder Client
- Path Intellisense
- Error Lens

## 3. Configuración del editor

Se recomienda activar:
- format on save
- editor minimap
- auto-save coordinado
- source control integrado
- recomendaciones de lint y formatter

## 4. Estructura del repositorio

```text
PoliScroll/
├── README.md
├── AGENTS.md
├── .github/
├── .vscode/
├── docs/
├── apps/
├── services/
├── packages/
├── infra/
├── .env.example
└── .gitignore
```

## 5. Variables de entorno

Crear un archivo .env.local o .env con los datos necesarios para:

- base de datos
- autenticación con Cognito
- API de IA
- WebSockets
- servicios de AWS
- configuraciones de entorno

Variables base esperadas:

- AWS_REGION
- COGNITO_USER_POOL_ID
- COGNITO_CLIENT_ID
- COGNITO_CLIENT_SECRET
- NEXT_PUBLIC_COGNITO_USER_POOL_ID
- NEXT_PUBLIC_COGNITO_CLIENT_ID
- DATABASE_URL
- REDIS_URL
- API_BASE_URL

No se deben hardcodear secretos en el código ni en archivos públicos.

## 6. Flujo recomendado

1. clonar el repositorio
2. instalar dependencias del proyecto
3. preparar entorno local
4. validar compilación base
5. crear modelos y servicios base
6. construir módulos principales
7. integrar IA y real time
8. programar despliegue por etapas

## 7. Buenas prácticas

- mantener documentación actualizada
- no mezclar cambios de infraestructura y lógica funcional
- usar ramas por objetivo
- verificar cada bloque antes de pasar al siguiente
- mantener un .env.example actualizado

## 8. Siguiente paso

Una vez concluido el setup local, se avanzará hacia la base del proyecto, módulos por rol y primera versión del MVP funcional.
