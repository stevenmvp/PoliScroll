# Arquitectura general del sistema

## 1. Propósito de la arquitectura

La aplicación debe soportar:

- alto volumen de usuarios simultáneos
- feedback y resultado instantáneos
- contenidos educativos dinámicos
- IA para diagnóstico y rutas de aprendizaje
- despliegue controlado por etapas

## 2. Capa de front-end

### Responsabilidades
- render de la experiencia tipo reel
- pantallas por rol
- paneles de profesor, estudiante y administrador
- animaciones, microinteracciones y transiciones

### Tecnologías sugeridas
- Next.js
- TypeScript
- React
- Tailwind CSS
- Framer Motion

## 3. Capa de back-end

### Responsabilidades
- autenticación y autorización
- administración de usuarios y roles
- gestión de contenido
- creación y publicación de actividades
- control de sesiones y aulas
- validación de acceso por sesión Cognito

### Tecnologías sugeridas
- Node.js o NestJS
- PostgreSQL
- Redis
- WebSockets
- Amazon Cognito

### Regla de acceso
Toda funcionalidad principal de la aplicación deberá estar protegida por sesión autenticada. Si el usuario no está registrado o no tiene sesión válida, solo se habilitarán pantallas mínimas de acceso, landing o estado de autenticación. Los módulos de profesor, estudiante y administrador no serán visibles ni accesibles sin validación previa.

## 4. Capa de tiempo real

### Responsabilidades
- sincronizar actividad por alumno
- actualizar ranking de sesión
- administrar lobby
- enviar feedback por evento

### Estrategia
- WebSockets para eventos en vivo
- Redis para cache y coordinación rápida
- modelo de eventos para actualizaciones de estado

## 5. Capa de IA

### Responsabilidades
- analizar respuesta del estudiante
- identificar error conceptual
- generar ruta de aprendizaje
- sugerir contenido siguiente
- construir feedback breve y útil

### Reglas
- evitar respuesta directa sin explicación
- priorizar guías pedagógicas
- mantener contexto del estudiante
- limitar el tiempo y la cantidad de información para no romper el flujo

## 6. Capa de datos

### Persistencia
- PostgreSQL para entidades de negocio
- Redis para sesiones y cache
- logs y auditoría para trazabilidad

### Modelos principales
- usuarios
- roles y autoridades
- cursos y módulos
- grupos y aulas
- actividades y preguntas
- respuestas e intentos
- progreso individual
- rankings y eventos de sesión

## 7. Capa de infraestructura

### Objetivos
- entorno local estable
- staging para validación
- producción preparada para despliegue gradual

### Tecnologías sugeridas
- Docker
- CI/CD
- AWS
- monitorización de servicios
- manejo centralizado de variables de entorno

## 8. Arquitectura recomendada por capas

```text
Client (Web App)
  ↓
Frontend / UI
  ↓
API Backend
  ↓
Domain Services
  ↓
Database + Redis + AI + Realtime
```

## 9. Recomendación final

La arquitectura debe priorizar velocidad, claridad y modularidad. El producto se construirá por dominios y capas funcionales para que los cambios futuros no rompan la base general del sistema.

## 10. Módulos frente a instancias

La plataforma tendrá 10 módulos funcionales principales: identidad y acceso, usuarios y roles, perfil y progreso, aulas y grupos, biblioteca de contenidos, creador de experiencias, motor de actividades, sesiones en tiempo real, IA pedagógica y analítica/operación.

Los juegos, actividades y mapas no serán módulos separados. Serán plantillas y contenidos configurables del motor de actividades. Cuando un profesor publique uno para un grupo o una sesión, se creará una instancia con su propio ciclo de vida y estado runtime.

La separación completa está documentada en [docs/09-modulos-y-modelo-de-instancias/README.md](../09-modulos-y-modelo-de-instancias/README.md).
