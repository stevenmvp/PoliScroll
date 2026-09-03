# Identidad visual

## Dirección

PoliScroll utilizará la paleta institucional del Politécnico Grancolombiano como base visual. El sistema debe sentirse educativo, activo y confiable, con suficiente contraste para lectura rápida en celulares y pantallas de aula.

## Jerarquía de color

### Base institucional

| Uso | Color | HEX | RGB |
| --- | --- | --- | --- |
| Superficie principal | Blanco | `#FFFFFF` | 255, 255, 255 |
| Celeste / Cyan | Pantone 312 C | `#1FB2DE` | 30, 180, 220 |
| Azul oscuro / Azul marino | Pantone 2955 C | `#0F385A` | 15, 55, 90 |

El blanco es el color principal de superficies, fondos y lectura. El azul marino se utilizará para encabezados, navegación, texto fuerte y elementos estructurales. El celeste se utilizará para acciones primarias, progreso, enlaces, foco y llamadas visuales.

### Paleta secundaria

| Color | HEX | Uso recomendado |
| --- | --- | --- |
| Amarillo / Naranja | `#FBAF17` | alertas suaves, energía, recompensas |
| Verde limón | `#A6CE38` | éxito, avance, respuestas correctas |
| Rosa / Fucsia | `#EC0677` | rachas, logros, eventos destacados |
| Cian claro | `#65C9DF` | fondos suaves, estados informativos |

## Reglas de aplicación

- blanco como superficie visual dominante
- azul marino para texto principal y contraste institucional
- celeste como acción primaria, no como fondo total de lectura
- colores secundarios reservados para estados y gamificación
- no usar el morado como color dominante
- no usar modo oscuro como apariencia predeterminada
- mantener contraste accesible entre texto y superficie
- el color nunca debe ser el único indicador de éxito, error o estado

## Componentes

### Estudiante

La interfaz debe priorizar blanco, azul marino y celeste. El amarillo, verde limón y fucsia pueden identificar recompensas, progreso y rachas sin saturar la pantalla.

### Profesor

El panel debe usar fondos blancos, navegación azul marino y acciones celestes. Los estados de grupos y actividades usarán la paleta secundaria con etiquetas textuales.

### Administrador

La interfaz debe ser más sobria: blanco y azul marino como base, celeste para acciones y secundarios solo para alertas, salud del sistema y métricas.

## Tokens técnicos

Los tokens se centralizan en `apps/web/app/globals.css` para que las aplicaciones web, administración y paquetes compartidos puedan reutilizarlos sin duplicar valores.