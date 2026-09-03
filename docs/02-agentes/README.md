# Delegación de tareas y roles de agentes

## Objetivo

Definir cómo se dividirán las responsabilidades del proyecto para evitar solapamiento, acelerar el desarrollo y mantener trazabilidad en cada fase.

## Agentes principales

### Product / Strategy Agent
- define objetivos del producto
- valida necesidades de negocio
- prioriza requisitos
- mantiene visión global del producto

### UX / Design Agent
- diseña experiencia de usuario
- crea prototipos visuales
- valida flujo de navegación
- propone sistemas de diseño

### Frontend Agent
- construye interfaces
- facilita experiencia mobile-first
- desarrolla componentes del reel, dashboard y actividades

### Backend Agent
- define APIs y servicios
- gestiona usuarios, roles, contenido y aulas
- administra lógica de negocio

### Realtime Agent
- gestiona WebSockets
- sincroniza sesiones y rankings
- resuelve problemas de latencia y estado en vivo

### IA Agent
- crea prompts, diagnósticos y rutas de aprendizaje
- integra feedback automático
- valida calidad pedagógica del sistema

### Data / Analytics Agent
- lleva métricas y KPI
- supervisa progreso y rendimiento
- conecta dashboards y reportes

### DevOps / Cloud Agent
- prepara entorno local
- gestiona Docker y variables de entorno
- prepara AWS y despliegues por fases

## Subagentes sugeridos

### Explore
Usado para investigación, exploración de referencias, búsquedas y análisis de contexto.

### Frontend Specialist
Encargado de interfaces, microinteracciones y componentes visuales.

### Backend Specialist
Encargado de APIs, autenticación y lógica empresarial.

### Realtime Specialist
Encargado de sesiones en vivo y sincronización de eventos.

### IA Specialist
Encargado del motor de prompt, feedback y sugerencias de resolución.

### QA Specialist
Encargado de pruebas, validación y revisión de calidad.

### DevOps Specialist
Encargado de infraestructura, cloud y despliegues.

## Mecanismo de trabajo

- cada fase tendrá un responsable principal
- las tareas deben ser revisadas en entregables concretos
- cada responsable documenta su bloque
- las decisiones técnicas se registran en la documentación del repositorio

## Regla de delegación

Cuando se inicie la ejecución del proyecto, las tareas se dividirán así:

- entorno: DevOps + setup
- UX: Design Agent
- frontend: Frontend Agent
- backend: Backend Agent
- IA: IA Agent
- tiempo real: Realtime Agent
- calidad: QA Agent
- coordinación: Product Agent

## Resultado esperado

Un desarrollo organizado, trazable y escalable, con responsabilidades claras desde el inicio y capacidad de crecimiento por fases.
