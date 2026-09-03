# Copilot Instructions

Este proyecto debe construirse con un enfoque de ingeniería modular, documentación clara y despliegue incremental.

## Objetivo

Desarrollar una aplicación educativa interactiva tipo reel, con flujo rápido, IA orientada a retroalimentación pedagógica y gestión por roles.

## Prioridades

1. Mantener la experiencia del usuario rápida y clara.
2. Separar claramente los roles de administrador, profesor y estudiante.
3. Diseñar la base del proyecto antes del despliegue completo.
4. Evitar infraestructura compleja antes de validar la estructura funcional.
5. Documentar cada fase antes de implementar cambios importantes.

## Estructura esperada

- README principal con visión general
- AGENTS.md para la coordinación de trabajo por fases
- docs/ con planes, arquitectura, setup y despliegue
- apps/ para frontend y admin
- services/ para backend y motor de IA
- infra/ para despliegues y configuración

## Patrones recomendados

- componentes reutilizables y bien nombrados
- backend con servicios separados por dominio
- configuración centralizada en variables de entorno
- no hardcodear secretos ni configuraciones locales
- tests mínimos para cada dominio crítico
- respuestas de IA validadas por contexto pedagógico

## Restricciones

- evitar soluciones monolíticas si se puede modularizar
- no hacer despliegues finales sin staging previo
- no mezclar tareas de diseño, backend y despliegue en el mismo cambio
- mantener la documentación actualizada con cada fase

## Siguiente fase

Se trabajará primero en:

- configuración del entorno
- extensiones del IDE
- base del proyecto
- estructura de módulos
- preparación para AWS con despliegue controlado
