# PoliScroll

PoliScroll es un proyecto de plataforma educativa interactiva orientada a estudiantes, profesores y administradores, con una experiencia tipo “reel” o “short-form learning”. La idea central es convertir la enseñanza en un flujo rápido, visual, reactivo y motivador, con microaprendizajes, feedback inmediato y apoyo de inteligencia artificial para guiar procesos de resolución, retroalimentación y mejora continua.

## Objetivo general

Desarrollar una aplicación web de aprendizaje en tiempo real que combine:

- experiencias tipo reel
- actividades dinámicas y minijuegos
- IA para corrección, diagnósticos y rutas de aprendizaje
- salas en vivo para clases masivas
- gestión por roles: administrador, profesor y estudiante
- analítica y seguimiento del progreso académico

## Visión del producto

La aplicación busca generar un ciclo de aprendizaje de alta velocidad:

1. contenido corto y visual
2. interacción inmediata
3. feedback instantáneo
4. revisión del error con IA
5. recompensa y continuidad del flujo
6. progresión de conocimiento por tema y nivel

Esto permite cubrir contextos de evaluación, práctica, quices, gamificación y seguimiento de rendimiento en aulas y grupos.

## Roles del sistema

### 1. Administrador
- gestión de usuarios
- configuración del sistema
- control de contenido global
- supervisión de métricas y costos
- seguridad, auditoría y mantenimiento

### 2. Profesor / creador
- creación de aulas y grupos
- desarrollo de actividades
- personalización de temas y niveles
- control de sesiones en vivo
- análisis de rendimiento y errores
- uso de IA para sugerencias y rutas de aprendizaje

### 3. Estudiante
- acceso a actividades y desafíos
- interacción con contenido tipo reel
- feedback inmediato
- seguimiento de avance y progreso
- análisis de errores guiado por IA

## Principios del proyecto

- rapidez antes que complejidad superficial
- UX clara, atractiva y de bajo fricción
- aprendizaje con feedback inmediato
- a la IA como guía pedagógica, no como reemplazo del proceso
- seguridad, escalabilidad y mantenimiento desde el inicio
- modularidad y evolución por fases

## Estructura del repositorio

```text
PoliScroll/
├── README.md
├── AGENTS.md
├── .github/
│   └── copilot-instructions.md
├── docs/
│   ├── 01-plan-general/
│   ├── 02-agentes/
│   ├── 03-arquitectura/
│   ├── 04-roadmap/
│   ├── 05-setup/
│   ├── 06-aws/
│   ├── 07-cognito-auth/
│   ├── 08-identidad-visual/
│   ├── 09-modulos-y-modelo-de-instancias/
│   ├── 10-amplify/
│   └── 11-contrato-de-conexiones/
├── apps/
│   ├── web/
│   └── admin/
├── services/
│   ├── api/
│   ├── realtime/
│   ├── ai/
│   └── analytics/
├── packages/
│   ├── shared/
│   ├── ui/
│   └── config/
├── infra/
│   ├── terraform/
│   └── docker/
└── .env.example
```

## Fases de construcción

El proyecto se ejecutará por etapas bien definidas:

1. Diagnóstico y validación del problema
2. Arquitectura y diseño
3. Base del proyecto y entorno de desarrollo
4. MVP de roles y flujo principal
5. IA y feedback pedagógico
6. Aulas en tiempo real y sesiones masivas
7. Minijuegos, gamificación y analítica
8. Preparación para despliegue y AWS
9. Lanzamiento piloto
10. Iteración y crecimiento

## Plan operativo de trabajo

Se trabajará en forma modular para evitar bloqueos y reducir el riesgo de configuración tardía.

### Orden recomendado

- definir el plan base
- preparar el entorno de desarrollo
- instalar extensiones y herramientas recomendadas
- definir la arquitectura del repositorio
- construir la base del proyecto
- crear la estructura de módulos por rol
- construir el backend base
- conectar servicios en tiempo real
- integrar IA y feedback
- preparar variables de entorno y despliegue
- subir al entorno AWS en fases controladas

## Stack sugerido

### Frontend
- Next.js
- TypeScript
- React
- Framer Motion
- Tailwind CSS
- soporte PWA y app installable

### Backend
- NestJS o Node.js API
- PostgreSQL
- Redis
- WebSockets

### Autenticación y acceso
- Amazon Cognito para registro, login y control de sesiones
- roles y permisos sincronizados con el backend
- validación del usuario antes de habilitar módulos

### IA
- API de LLM con validación por prompt
- pipeline de diagnóstico, feedback y rutas de aprendizaje

### Infraestructura
- AWS
- Docker
- CI/CD
- observabilidad y monitoreo

## Recomendación para esta fase inicial

La prioridad inmediata es construir una base sólida del proyecto y no entrar a configuración final de infraestructura antes de confirmar lo siguiente:

- estructura del repositorio
- convenciones de código
- roles y módulos
- base de datos mínima
- consola y entorno de trabajo local
- variables de entorno centralizadas
- pipeline de despliegue incremental

## Siguiente paso

Se continuará con:

- creación de documentos detallados del plan
- definición de roles de agentes y subagentes
- configuración del entorno de trabajo en VS Code
- instalación de extensiones esenciales
- scaffold base del proyecto
- preparación para AWS en fases controladas

## Documentación de apoyo

- [docs/01-plan-general/README.md](docs/01-plan-general/README.md)
- [docs/02-agentes/README.md](docs/02-agentes/README.md)
- [docs/03-arquitectura/README.md](docs/03-arquitectura/README.md)
- [docs/04-roadmap/README.md](docs/04-roadmap/README.md)
- [docs/05-setup/README.md](docs/05-setup/README.md)
- [docs/06-aws/README.md](docs/06-aws/README.md)
- [docs/08-identidad-visual/README.md](docs/08-identidad-visual/README.md)
- [docs/09-modulos-y-modelo-de-instancias/README.md](docs/09-modulos-y-modelo-de-instancias/README.md)
- [docs/10-amplify/README.md](docs/10-amplify/README.md)
- [docs/11-contrato-de-conexiones/README.md](docs/11-contrato-de-conexiones/README.md)

## Convención de trabajo

Se prioriza:

- trazabilidad de tareas
- documentación clara por fase
- separación efectiva entre UX, backend, IA, despliegue y QA
- validación continua antes de pasar a la siguiente fase
- despliegue incremental, no configuraciones finales a la ligera
- configuración real en AWS y servicios gestionados, nunca secretos locales como base estándar
- uso de .env.example como referencia y no como fuente real de credenciales

## Regla de entorno

Este proyecto se construirá bajo la política siguiente:

- todo lo sensible se configura en AWS Amplify, Cognito, RDS, Redis y servicios de despliegue
- el repositorio no debe almacenar secretos ni configuraciones locales finales
- las variables se gestionan por entorno: dev, staging y producción
- si cambia el destino, cambia la config del servicio, no la lógica del app
