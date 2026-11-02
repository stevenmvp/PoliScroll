# Plan de Migración y Portabilidad: Vortex Arcade a PoliScroll

Plan integral para empaquetar, transportar e integrar todo el ecosistema de **Vortex Arcade** (16 minijuegos, motor socrático con Gemini API, Súper Módulo, Metrónomo adaptativo y sistema de audio) dentro del repositorio **PoliScroll** (React + Vite + Tailwind CSS).

---

## Decisiones Confirmadas del Usuario

> [!IMPORTANT]
> - **Tecnología de Destino**: Confirmado **React + Vite + Tailwind CSS**, garantizando compatibilidad 100% nativa con las dependencias actuales (`lucide-react`, `tone`, `canvas-confetti`, `@google/genai`).
> - **Alcance**: **Sistema Completo** (16 juegos 2D/3D, tutor académico IA socrático, Cuaderno de Feedback, salón Pachinko/Gachapón, Súper Módulo de configuración y Metrónomo).
> - **Enfoque de Adaptación**: Arquitectura modular desacoplada (`/src/modules/arcade`) diseñada para incrustarse fluidamente dentro de la interfaz, rutas o vistas de scroll vertical/horizontal de PoliScroll sin colisiones de estilos ni rutas.

---

## 1. Visión General y Estrategia de Portabilidad

### 1.1 ¿Qué se va a transportar?
1. **Core de Juegos (16 Minijuegos 2D & 3D)**:
   - Registro unificado (`src/games/registry.ts`).
   - Todos los minijuegos encapsulados con sus vistas 16:10 consistentes: Frogger Rush, Synapse Beat Rush, Velocity Sonic Drift, Logic Circuit Deductor, Bridge Extender, Pixel Slash, Chicken Hop, Chroma Matrix, Orbit Beat, Flappy Wings, Trivia Roguelite, etc.
   - Algoritmo matemático `SolvabilityVerifier` que previene cualquier camino sin salida o combinaciones irresolubles.
2. **Capa Académica con IA (Gemini API & Router de 4 Dominios)**:
   - Clasificador temático estricto (Academia/Ciencia, Cultura Pop/Videojuegos, Normativa Local y Cultura General).
   - Generador de paquetes de preguntas/conceptos con citas y fuentes verificadas.
   - Cuaderno Académico con historial de errores, desglose socrático y chat interactivo con el tutor.
3. **Súper Módulo y Modos de Juego**:
   - `SuperGameEditorModal`: Configuración de dificultad, habilitación de juegos, duraciones y multiplicadores.
   - `WorkoutRunner`: Motor de playlists guiadas (3 juegos, 5 juegos, o custom).
   - `FrenzyMode`: Rotación dinámica con aceleración por metrónomo.
   - `PachinkoSalon`: Minijuego pachinko físico con simulación de clavos giratorios y máquina gachapón.
4. **Motor de Audio Interactivo (`Tone.js`)**:
   - Ticks metronómicos, sintetizador FM/AM, fanfarrias polifónicas y música ambiental adaptativa.

---

## 2. Diagrama de Arquitectura Modular para PoliScroll

```
┌────────────────────────────────────────────────────────────────────────┐
│                        POLISCROLL MAIN APP                             │
│       (Navbar, Layout, Vistas de Scroll, Secciones de la App)          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴─────────────────────────┐
           │ Integración Limpia: Componente de Punto de Entrada│
           │           <PoliScrollArcadeModule />             │
           └────────────────────────┬─────────────────────────┘
                                    │
     ┌──────────────────────────────┼──────────────────────────────┐
     ▼                              ▼                              ▼
┌──────────────┐             ┌──────────────┐              ┌──────────────┐
│  GAME ENGINE │             │ ACADEMIC IA  │              │ SUPER MODULE │
│ 16 Minijuegos│             │ Gemini 2.5   │              │ Metrónomo    │
│  Registry    │             │ Socrático    │              │ Playlists 3/5│
│  Solvability │             │ Cuaderno     │              │ Editor Dific.│
└──────┬───────┘             └──────┬───────┘              └──────┬───────┘
       │                            │                             │
       └────────────────────────────┼─────────────────────────────┘
                                    ▼
       ┌──────────────────────────────────────────────────────────┐
       │ PERSISTENCIA & AUDIO COMPARTIDO (LocalStorage + Tone.js) │
       │  • progressionStore (Canicas, Récords, Desbloqueos)      │
       │  • academicStore (Temas, Historial de Sesiones)          │
       │  • arcadeConfigStore (Modo Maestro, Metrónomo, Overrides)│
       │  • soundManager (Síntesis acústica Web Audio)            │
       └──────────────────────────────────────────────────────────┘
```

---

## 3. Plan de Empaquetado y Pasos de Migración

### Fase A: Preparación del Paquete Modular de Exportación
Crear un bundle exportable limpio dentro del repositorio actual con un script automatizado que agrupe todos los componentes sin alterar la compilación actual:
1. **Generación del Script de Exportación (`scripts/export-for-poliscroll.sh`)**:
   - Unifica `/src/games`, `/src/services`, `/src/types` y los componentes de arcade en una carpeta modular autónoma `src/modules/arcade/`.
2. **Archivo de Dependencias (`poliscroll-deps.json`)**:
   - Especificación exacta de las librerías a instalar en PoliScroll:
     ```json
     {
       "dependencies": {
         "@google/genai": "^0.1.2",
         "canvas-confetti": "^1.9.4",
         "lucide-react": "^1.16.0",
         "tone": "^15.0.4"
       },
       "devDependencies": {
         "@types/canvas-confetti": "^1.9.0"
       }
     }
     ```

### Fase B: Estructura de Destino Recomendada en PoliScroll
En el repositorio `PoliScroll`, los archivos se organizarán de la siguiente manera:
```
PoliScroll/
├── src/
│   ├── modules/
│   │   └── arcade/
│   │       ├── games/               # Los 16 minijuegos optimizados
│   │       ├── components/          # Vistas (ActiveGamePlayer, CatalogView, FrenzyMode, etc.)
│   │       ├── services/            # soundManager, academicStore, arcadeConfigStore, solvabilityVerifier
│   │       ├── types/               # Definiciones TypeScript
│   │       └── index.ts             # Punto de entrada exportable único
│   ├── App.tsx                      # Importa e integra <PoliScrollArcadeModule />
│   └── main.tsx
├── package.json
└── vite.config.ts
```

### Fase C: Opciones de Inyección en la Interfaz de PoliScroll
Se ofrecerán dos modalidades de integración para que encaje naturalmente con el diseño de PoliScroll:
1. **Modo Sección / Pestaña**: Un tab o ruta dedicada dentro del scroll o navegación de PoliScroll que renderiza el catálogo y los entrenamientos.
2. **Modo Widget / Minijuegos en Scroll**: Un componente flotante o desplegable que permite activar un minijuego o entrenamiento rápido directamente entre las publicaciones o scrolls de la aplicación.

### Fase D: Documentación y Guía de Conexión Git
Se creará un documento `POLISCROLL_INTEGRATION_GUIDE.md` con:
- Comandos exactos de Git para sincronizar (`git remote add`, `git cherry-pick` o copia limpia por carpetas).
- Configuración de variables de entorno (`VITE_GEMINI_API_KEY` para el tutor académico).
- Verificación paso a paso para compilar con `npm run build` en PoliScroll.

---

## 4. Verificación y Criterios de Aceptación
- [ ] Todo el código permanece compilando al 100% sin romper el applet actual (`compile_applet` exitoso).
- [ ] El paquete de exportación incluye las 16 mecánicas de juego, el tutor IA y el Súper Módulo.
- [ ] No existen dependencias rígidas de rutas que impidan montarlo dentro de cualquier subcarpeta de PoliScroll.
