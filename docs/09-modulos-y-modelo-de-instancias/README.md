# Módulos, experiencias e instancias

## Decisión de arquitectura

PoliScroll no tendrá un módulo independiente por cada juego, actividad o mapa. Tendrá módulos funcionales estables y un motor de contenido capaz de activar muchas experiencias reutilizables.

La diferencia es importante:

- **módulo funcional:** una capacidad permanente de la plataforma
- **tipo de experiencia:** una plantilla de actividad o juego
- **contenido:** una configuración pedagógica concreta
- **instancia:** una copia publicada para un grupo, curso o sesión
- **estado runtime:** la situación actual de esa instancia durante su uso

## Módulos funcionales iniciales

La primera versión completa tendrá **10 módulos principales**:

### 1. Identidad y acceso

Registro, inicio de sesión, recuperación de cuenta, sesión y validación con Cognito.

### 2. Usuarios y roles

Administración de perfiles, roles, permisos y grupos Cognito: administrador, profesor y estudiante.

### 3. Perfil y progreso

Perfil, historial, competencias, logros, rachas y progreso guardado.

### 4. Aulas y grupos

Creación de aulas, grupos, invitaciones, códigos, miembros y permisos dentro del aula.

### 5. Biblioteca y contenidos

Cursos, módulos educativos, lecciones, recursos, etiquetas, niveles y versiones.

### 6. Creador de experiencias

Editor para armar una secuencia tipo reel usando tarjetas, preguntas, explicaciones y minijuegos.

### 7. Motor de actividades y juegos

Ejecuta las plantillas de interacción y las conecta con contenido pedagógico, reglas, tiempo y puntuación.

### 8. Sesiones en vivo y tiempo real

Lobby, control del profesor, sincronización, respuestas, ranking y recuperación de conexión.

### 9. IA y feedback pedagógico

Generación asistida, diagnóstico de errores, pistas, rutas de aprendizaje y recomendaciones.

### 10. Analítica, administración y operación

Métricas de aprendizaje, reportes, moderación, auditoría, costos de IA, observabilidad y configuración operativa.

## Tipos de experiencias activables

El motor de actividades podrá comenzar con estas **12 plantillas**:

1. selección múltiple
2. verdadero o falso
3. respuesta corta
4. ordenamiento de pasos
5. emparejamiento de conceptos
6. clasificación por categorías
7. completar fórmula o código
8. deslizar afirmación correcta o incorrecta
9. selección de objetivos en movimiento
10. mapa o recorrido de aprendizaje
11. reto colaborativo de aula
12. explicación y reflexión guiada por IA

Estas plantillas no son módulos de negocio. Son tipos de contenido que el profesor puede combinar dentro de un reel, curso o sesión.

## Modelo de activación

```text
Módulo funcional
  -> Tipo de experiencia
      -> Contenido configurado
          -> Publicación
              -> Instancia para aula o estudiante
                  -> Estado durante la ejecución
```

## Ejemplo: trivia de cálculo diferencial

### Tipo

`multiple-choice`

### Contenido

- tema: regla de la cadena
- pregunta: derivar una función compuesta
- opciones: cuatro respuestas
- respuesta correcta
- explicación
- dificultad
- tiempo límite
- feedback IA

### Instancia

El profesor publica esa actividad para el grupo `Cálculo I`, en la sesión del 10 de septiembre.

### Estado de la instancia

- borrador
- publicada
- programada
- lobby
- activa
- pausada
- finalizada
- archivada

### Estado del estudiante

- no iniciada
- disponible
- iniciada
- respondida
- correcta
- incorrecta
- revisando feedback
- completada
- pendiente de sincronización

## Estados de una sesión en vivo

Las sesiones tendrán un ciclo controlado:

1. `draft`: creada pero no publicada
2. `scheduled`: programada
3. `lobby`: estudiantes ingresando
4. `ready`: todos preparados o profesor listo
5. `active`: actividad en ejecución
6. `paused`: profesor pausó la sesión
7. `review`: revisión de respuestas y feedback
8. `completed`: sesión terminada
9. `sync_pending`: hay eventos pendientes de sincronizar
10. `archived`: solo lectura

## Qué debe ser configurable

El profesor podrá configurar sin crear un módulo nuevo:

- tipo de experiencia
- materia y tema
- nivel de dificultad
- cantidad de preguntas
- tiempo por reto
- navegación libre o controlada
- puntaje y bonificaciones
- feedback inmediato o al final
- uso de IA
- visibilidad del ranking
- accesibilidad
- contenido multimedia
- reglas de reintento

## Qué no debe convertirse en módulo separado

No se deben crear módulos independientes para:

- cada trivia
- cada minijuego
- cada materia
- cada mapa
- cada curso
- cada sesión
- cada variación visual

Todos ellos deben ser datos y configuraciones manejados por los módulos existentes.

## Escalabilidad esperada

Con 10 módulos funcionales y 12 plantillas iniciales, el sistema puede producir cientos o miles de experiencias sin multiplicar la arquitectura. Posteriormente se podrán agregar nuevas plantillas como plugins del motor de actividades sin modificar usuarios, aulas, Cognito o analítica.

## Entidades principales

- `User`
- `Role`
- `Organization`
- `Classroom`
- `Group`
- `Course`
- `ContentModule`
- `Experience`
- `ExperienceTemplate`
- `Session`
- `Participant`
- `Attempt`
- `Progress`
- `Feedback`
- `LearningPath`
- `AnalyticsEvent`

## Regla final

Los módulos representan capacidades del producto. Las actividades, juegos y mapas representan experiencias configurables. Las instancias representan publicaciones concretas. Los estados representan el ciclo de vida y la ejecución de cada instancia.
