# AGENTS.md

Este repositorio sigue una estrategia de trabajo por fases, con tareas separadas por especialidad y entregas verificables. El objetivo es evitar sobrecarga en una sola capa del sistema y mantener un flujo controlado desde el diagnóstico hasta la implementación y despliegue.

## Principios generales

- trabajar por módulos
- documentar cada fase antes de implementar
- no mezclar infraestructura, diseño y lógica en una sola etapa
- priorizar validación y pruebas antes de avanzar
- mantener una estructura de repositorio limpia y reproducible
- separar despliegue local, staging y producción

## Roles principales

### 1. Product / Strategy
Responsable de:
- visión del producto
- objetivos pedagógicos
- definición de roles y usuarios
- priorización de funcionalidades
- validación de valor y experiencia
- asegurar que el acceso al producto dependa de autenticación válida con Cognito

### 2. UX / Design
Responsable de:
- wireframes
- flujo de usuario por rol
- identidad visual
- microinteracciones y motion design
- prototipos navegables
- diseño de estados de acceso, bloqueo y sesión no autenticada

### 2. UX / Design
Responsable de:
- wireframes
- flujo de usuario por rol
- identidad visual
- microinteracciones y motion design
- prototipos navegables

### 3. Frontend
Responsable de:
- interfaz web
- componente del “reel”
- paneles de profesor y estudiante
- experiencia interactiva mobile-first

### 4. Backend
Responsable de:
- APIs
- autenticación
- roles y permisos
- gestión de contenido
- sesiones y aulas
- lógica de negocio

### 5. Realtime / Infraestructura
Responsable de:
- WebSockets
- sincronización en vivo
- balance de carga
- observabilidad
- monitoreo

### 6. IA / Learning Engine
Responsable de:
- prompts y rutas de aprendizaje
- análisis de respuesta
- feedback automático
- sugerencias pedagógicas
- diagnóstico de errores

### 7. Data / Analytics
Responsable de:
- métricas y KPI
- analítica de progreso
- dashboard de resultados
- modelado de información

### 8. DevOps / Cloud
Responsable de:
- entorno local y remoto
- Docker
- CI/CD
- AWS
- variables de entorno
- despliegues por fases

## Orden de trabajo recomendado

1. definir y validar la visión del producto
2. modelar roles, actividades y sesiones
3. construir entorno base local
4. crear estructura del repositorio
5. desarrollar backend base
6. desarrollar frontend base
7. integrar tiempo real
8. integrar IA
9. completar analítica y métricas
10. preparar despliegue incremental en AWS

## Reglas de colaboración

- cada cambio debe tener un propósito claro
- cada funcionalidad nueva debe estar documentada
- los documentos de soporte deben mantenerse actualizados
- cada fase debe tener resultado verificable
- no se despliega a producción sin validación de staging
- no se deben usar variables locales ni credenciales reales como base de trabajo
- la configuración del entorno se gestiona en AWS y servicios correspondientes
- los secretos quedan en variables del servicio, no en archivos del repositorio

## Subagentes sugeridos

- Explore: investigación de contexto, referencias y patrones de diseño
- Frontend Specialist: implementación UI y componentes interactivos
- Backend Specialist: APIs, autenticación y lógica empresarial
- Realtime Specialist: sesiones, sincronización y WebSockets
- IA Specialist: prompts, análisis de rendimiento y feedback
- DevOps Specialist: infraestructura, AWS, integraciones y despliegues
- QA Specialist: pruebas, validación y control de calidad

## Control de versionado

Se recomienda:

- ramas por objetivo: feature, fix, hotfix, infra
- commits con mensajes descriptivos
- PRs con checklist de revisión
- despliegue solo desde ramas de validación o release

## Roadmap de ejecución

- fase 0: entorno local y configuración
- fase 1: estructura base del proyecto
- fase 2: roles, usuarios y flujo inicial
- fase 3: aula, actividades y feedback
- fase 4: IA y rutas de aprendizaje
- fase 5: producción y AWS staging
- fase 6: pilotaje y ajuste

## Resultado esperado

El repositorio debe mantenerse como una base modular, escalable y lista para evolucionar sin caer en soluciones frágiles o acopladas.
