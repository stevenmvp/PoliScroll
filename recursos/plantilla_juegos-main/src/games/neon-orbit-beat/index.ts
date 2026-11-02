import { type GameDefinition } from '../../types/game';
import { NeonOrbitBeatView } from './view';

export const NeonOrbitBeatGame: GameDefinition = {
  id: 'neon-orbit-beat',
  title: 'Neon Orbit Beat',
  dimension: '2d',
  category: 'rhythm',
  difficulty: 'medio',
  tagline: 'Sincroniza tus saltos orbitales con el ritmo del sintetizador mientras esquivas lásers giratorios.',
  instruction: '¡Salta entre las 3 órbitas al compás para recolectar notas doradas y esquivar los arcos rojos!',
  article: {
    lore: 'El núcleo de pulsar armónico vibra a frecuencias subatómicas en el centro del acelerador cuántico.',
    mechanics: 'Tu canica gira continuamente a velocidad constante. Presiona Espacio o toca el botón para saltar de órbita y alinearte con los nodos de ritmo.',
    tips: [
      'Encadenar notas sin recibir daño dispara tu multiplicador de combo x2, x3 y x4.',
      'Cada 3 notas consecutivas ganas canicas adicionales.',
      'Los arcos rojos de peligro se mueven a distintas velocidades; calcula el cruce con anticipación.',
    ],
  },
  controlsDescription: {
    desktop: 'Espacio / Flechas Arriba-Abajo (Cambiar Órbita)',
    mobile: 'Botón CAMBIAR ÓRBITA o D-Pad arriba/abajo',
  },
  icon: 'Radio',
  color: '#06B6D4',
  accentColor: '#8B5CF6',
  unlockedByDefault: true,
  unlockCost: 0,
  Component: NeonOrbitBeatView,
};
