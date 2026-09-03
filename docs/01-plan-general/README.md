# Plan general del proyecto

## 1. Visión

PoliScroll es una aplicación educativa de aprendizaje rápido, visual y motivacional. Está diseñada para estudiantes, profesores y administradores, con una lógica centrada en microaprendizajes, interacción constante, feedback inmediato y asistencia de IA para guiar el proceso de resolución.

## 2. Objetivos

### Objetivo principal
Crear una plataforma web interactiva orientada a la educación, inspirada en la lógica de reels y microcontenido, con soporte de IA y sesiones en vivo.

### Objetivos específicos
- facilitar la creación de actividades por parte del profesor
- ofrecer experiencia atractiva en el estudiante
- permitir gestión y control por parte del administrador
- mejorar aprendizaje con feedback rápido y rutas de resolución
- soportar concurrencia real en aulas y grupos

## 3. Usuarios del sistema

### Estudiante
Se enfrenta a contenido breve, dinámico y visual. Necesita claridad, velocidad, emoción del progreso y apoyo inmediato ante errores.

### Profesor
Necesita crear actividades sin complicaciones, revisar grupos, ver rendimiento, controlar aulas y optimizar contenidos con apoyo de IA.

### Administrador
Necesita mantener la plataforma, administrar cuentas, moderar contenido, controlar métricas y supervisar sistemas globales.

## 4. Control de acceso y autenticación

La aplicación debe estar protegida por autenticación en Amazon Cognito. Esto significa que:

- todo usuario debe estar registrado e identificado
- cada sesión debe validarse antes de mostrar contenido relevante
- el acceso a módulos depende del rol asignado
- un usuario no autenticado solo tiene acceso a pantallas mínimas de entrada, registro o recuperación
- contenido sensible, grupos, materias y sesiones nunca se exponen sin validación

La seguridad no debe ser opcional ni posterior; debe ser parte del diseño del producto desde la primera fase.

## 4. Modelo de aprendizaje

El producto debe seguir un ciclo claro:

1. presentación breve del concepto
2. actividad o reto corto
3. interacción del usuario
4. retroalimentación instantánea
5. explicación de la ruta de resolución
6. recompensa y siguiente contenido

## 5. Fases del proyecto

### Fase 0. Diagnóstico y validación
- análisis de competencia
- perfilamiento de usuarios
- definición del core loop
- validación de IA y escalabilidad

### Fase 1. Diseño de experiencia y arquitectura
- UX, navegación y flujo por roles
- arquitectura general de software
- modelado de datos y eventos
- definición del stack

### Fase 2. Base del proyecto
- entorno local
- extensiones y herramientas
- repositorio y estructura modular
- convenciones de trabajo

### Fase 3. MVP funcional
- login y roles
- paneles por usuario
- aula y sesión base
- actividades básicas
- feedback inicial

### Fase 4. IA y aprendizaje adaptativo
- diagnósticos por respuesta
- rutas de resolución
- feedback pedagógico guiado
- sugerencias de ejercicios

### Fase 5. Tiempo real y concurrencia
- lobby y salas masivas
- ranking en vivo
- sincronización de respuesta
- control del profesor

### Fase 6. Minijuegos y analítica
- nuevos tipos de retos
- métricas de rendimiento
- dashboards de progreso
- mejora de engagement

### Fase 7. Infraestructura y AWS
- variables de entorno
- despliegue por etapas
- staging y validación
- preparación para producción

## 6. Recomendación de trabajo

Se trabajará por tramos pequeños, con validación continua y preparación para escalado real. No se debe avanzar a infraestructura compleja antes de confirmar la base funcional.

## 7. Resultado deseado

Un producto con una experiencia altamente atraída por la generación actual, con identidad propia, aprendizaje estructurado, IA útil y capacidad de crecer hacia ambientes educativos masivos.
