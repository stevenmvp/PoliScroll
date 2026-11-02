import { type GameDefinition } from '../../types/game';
import { PixelSlashReflexView } from './view';

export const PixelSlashReflexGame: GameDefinition = {
  id: 'pixel-slash-reflex',
  title: 'Pixel Slash Reflex',
  dimension: '2d',
  category: 'reflex',
  difficulty: 'experto',
  tagline: 'Corta proyectiles con precisión milimétrica cuando alcancen la zona de impacto central.',
  instruction: '¡Presiona la dirección correspondiente cuando la flecha entre en el círculo!',
  article: {
    lore: 'El dojo de nanotecnología entrena reflejos sobrehumanos disparando cuchillas electromagnéticas hacia el punto cero.',
    mechanics: 'Observa la trayectoria de los dardos y ejecuta cortes direccionales exactos (Arriba, Abajo, Izquierda, Derecha) dentro del círculo central para activar contraataques.',
    tips: [
      'Esperar a que el dardo se torne dorado te da la calificación "PERFECT" con el doble de puntos.',
      'Mantener el combo aumenta la velocidad a la que se generan canicas.',
      'Usa el D-Pad táctil en pantallas celulares para reaccionar al instante.',
    ],
  },
  controlsDescription: {
    desktop: 'Flechas / WASD para cortar en cada dirección',
    mobile: 'D-Pad direccional en pantalla',
  },
  icon: 'Shield',
  color: '#EC4899',
  accentColor: '#F59E0B',
  unlockedByDefault: true,
  unlockCost: 0,
  Component: PixelSlashReflexView,
};
