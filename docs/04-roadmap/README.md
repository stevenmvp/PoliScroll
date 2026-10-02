# Roadmap de ejecución del proyecto

## Objetivo

Organizar la construcción de PoliScroll en hitos verificables y progresivos, con una secuencia clara de validación, documentación y entregables. Este plan fue ampliado a 20 fases para sostener un desarrollo más robusto, modular y escalable.

Este documento es la referencia operativa. El plan general describe la visión del producto, pero la numeración y los criterios de salida de este roadmap gobiernan el trabajo del repositorio.

## Principios de ejecución

- cada fase debe cerrar con evidencia verificable
- cada bloque debe tener dueño claro y documentación de apoyo
- no se mezcla infraestructura, UX y backend en el mismo hito
- la seguridad y autenticación se validan desde la fase inicial
- el despliegue real solo ocurre una vez que la base funcional se ha validado

## Fase 0: preparación del entorno y base del repositorio

### Estado

Completada localmente y validada en Amplify. La siguiente etapa es la Fase 1: diagnóstico del problema y validación del producto.

### Objetivos
- preparar el entorno local
- fijar la línea base de Node, npm y Git
- verificar que las aplicaciones puedan instalarse y compilarse
- documentar convenciones y variables sin secretos

### Entregables
- repositorio base
- estructura modular por capas documentada
- `.env.example`
- README principal y AGENTS.md
- evidencia de instalación, lint y build

### Validación
- `npm install --prefix apps/web` termina correctamente
- `npm install --prefix services/api` termina correctamente
- `npm run build:web` termina correctamente
- `npm run lint:web` termina correctamente
- `npm run build:api` termina correctamente
- el smoke test de Amplify publica una pantalla visible

### Observaciones

- `npm run lint:web` termina con código 0 y conserva tres warnings de navegación relativa.
- `npm run build:web` termina correctamente.
- `npm run build:api` termina correctamente.
- El smoke test de Amplify publica la pantalla de diagnóstico.

## Fase 1: diagnóstico del problema y validación del producto

### Objetivos
- confirmar público objetivo
- definir problema pedagógico
- validar propuesta de valor
- identificar necesidades de estudiantes, profesores y administradores

### Entregables
- mapa de usuarios
- brief de producto
- hipótesis de aprendizaje
- requisitos funcionales base

## Fase 2: definición de roles y permisos

### Objetivos
- definir acceso por perfil
- mapear permisos por módulo
- definir reglas de entidad y responsabilidad

### Entregables
- matriz de roles
- permisos por acción
- reglas de acceso para Cognito y backend

## Fase 3: arquitectura general y diseño de sistema

### Objetivos
- decidir stack base y capas de aplicación
- definir persistencia, eventos y servicios
- sintetizar flujos de usuario por rol

### Entregables
- arquitectura por capas
- diagrama de servicios
- modelo de datos inicial
- diseño de módulos

## Fase 4: diseño UX y flujo principal

### Objetivos
- diseñar experiencia mobile-first
- definir navegación por rol
- crear wireframes del core loop

### Entregables
- flujo principal de aprendizaje
- visual design system
- prototipo de navegación
- diseño de estados autenticados y no autenticados

## Fase 5: base frontend y app shell

### Objetivos
- instalar y arrancar la app web
- construir shell principal y layout base
- preparar soporte PWA y mobile

### Entregables
- app web funcionando
- navegación base
- layout responsive
- estado offline para el usuario

## Fase 6: autenticación y sesión Cognito

### Objetivos
- preparar variables de entorno para AWS y Cognito
- definir flujo de login y logout
- conectar sesiones con validación por token

### Entregables
- configuración de Cognito
- flujo de autenticación seguro
- políticas de acceso por entorno

## Fase 7: backend API base y validación de identidad

### Objetivos
- crear la API base
- validar JWT y claims de usuario
- proteger rutas por rol

### Entregables
- endpoints base
- middleware de autenticación
- validación de permisos
- salud del servicio

## Fase 8: roles, permisos y middleware de acceso

### Objetivos
- separar rutas de acceso por perfil
- bloquear módulos no autorizados
- asegurar la lógica de negocio por usuario

### Entregables
- middleware RBAC
- reglas por perfil
- protección de dashboards y módulos

## Fase 9: modelado de contenido y actividades

### Objetivos
- crear catálogo de módulos, temas y actividades
- definir estructura de contenido educativo
- preparar publicación y edición de recursos

### Entregables
- estructura de cursos y módulos
- modelos de actividad
- administración básica de contenido

## Fase 10: flujo de estudiante

### Objetivos
- construir recorrido principal del estudiante
- implementar dashboard, progreso y feedback
- habilitar práctica y seguimiento

### Entregables
- dashboard estudiantil
- lógica de rachas y progreso
- feedback inicial de actividades

## Fase 11: flujo de profesor

### Objetivos
- permitir creación de contenido y grupos
- habilitar seguimiento de rendimiento
- construir experiencia de gestión docente

### Entregables
- dashboard profesor
- gestión de grupos
- revisión de desempeño
- creación básica de actividades

## Fase 12: flujo de administrador

### Objetivos
- habilitar gestión global de usuarios y contenido
- supervisar métricas y seguridad
- centralizar configuración del sistema

### Entregables
- dashboard administrativo
- control de usuarios
- auditoría de acceso
- métricas globales

## Fase 13: motor de aprendizaje y feedback pedagógico

### Objetivos
- generar diagnósticos por respuesta
- construir rutas de aprendizaje por error
- mejorar claridad del feedback

### Entregables
- diagnósticos de error
- recomendaciones pedagógicas
- lógica de sugerencia por nivel

## Fase 14: IA y tutor inteligente

### Objetivos
- integrar prompts orientados a enseñanza
- validar calidad del feedback
- crear soporte de IA para práctica y resumen

### Entregables
- servicio IA base
- pipeline de análisis pedagógico
- respuesta contextualizada por rol

## Fase 15: aulas en vivo y sesiones masivas

### Objetivos
- construir lobby, sala y sincronización
- soportar actividades simultáneas
- controlar flujo de sesión por profesor

### Entregables
- sesiones en vivo
- ranking inmediato
- sincronización de respuestas
- panel de control del docente

## Fase 16: tiempo real y WebSockets

### Objetivos
- conectar sincronización en tiempo real
- manejar eventos de aula y progreso
- evitar latencia en la experiencia

### Entregables
- servicio realtime
- eventos de actualización
- observabilidad de conexiones

## Fase 17: analítica, métricas y dashboards

### Objetivos
- medir engagement, rendimiento y completitud
- activar KPI por módulo y sesión
- centralizar dato de progreso

### Entregables
- dashboards analíticos
- métricas por estudiante y grupo
- reportes de aprendizaje y retención

## Fase 18: gamificación, progresión y motivación

### Objetivos
- crear niveles, recompensas, logros y rachas
- aumentar la motivación en la experiencia
- ajustar la mecánica del aprendizaje

### Entregables
- sistema de puntos y logros
- progresión por misión
- experiencia motivacional en flujo

## Fase 19: seguridad, observabilidad y hardening

### Objetivos
- reforzar seguridad de endpoints y sesión
- validar logs, alertas y trazabilidad
- preparar la aplicación para staging y producción

### Entregables
- hardening de seguridad
- monitorización activa
- trazabilidad de eventos clave
- políticas de entorno

## Fase 20: despliegue en AWS y preparación de staging

### Objetivos
- desplegar infraestructura gestionada
- separar staging y producción
- verificar app real con variables de entorno en AWS

### Entregables
- instancia o ambiente de staging
- configuración AWS gestionada
- despliegue controlado
- validación del producto real

## Fase 21: pilotaje y ajuste continuo

### Objetivos
- lanzar pruebas con usuarios reales
- medir rendimiento pedagógico y de experiencia
- ajustar backlog con evidencia

### Entregables
- pilots funcionales
- reporte de ajustes
- plan de mejoras priorizadas

## Fase 22: crecimiento y optimización

### Objetivos
- escalar la arquitectura
- mejorar IA, infraestructura y UX
- preparar siguiente ciclo de expansión

### Entregables
- roadmap de mejora
- base para crecimiento institucional
- versión estable lista para evolución

## Criterio de salida por fase

Cada fase se considera cerrada cuando:
- el entregable existe
- la funcionalidad está validada
- la documentación se mantiene actualizada
- no quedan bloqueos críticos para la siguiente fase

## Secuencia sugerida por prioridad

1. entorno y base
2. roles y seguridad
3. frontend shell y navegación
4. backend y autenticación
5. contenido y módulos
6. estudiantes, profesores y admin
7. IA y learning engine
8. tiempo real
9. analítica y gamificación
10. staging y despliegue
11. pilotaje y mejora continua

## Resultado esperado

Una plataforma robusta, modular y preparada para evolucionar sin resolver todos los problemas a la vez. La clave es avanzar por fases con validación constante, arquitectura clara y control del entorno en AWS en vez de trabajos locales no gestionados.
