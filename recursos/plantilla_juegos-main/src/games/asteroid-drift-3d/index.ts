import { type GameDefinition } from '../../types/game';
import { AsteroidDrift3DView } from './view';

export const AsteroidDrift3DGame: GameDefinition = {
  id: 'asteroid-drift-3d',
  title: 'Asteroid Drift 3D',
  dimension: '3d',
  category: '3d',
  difficulty: 'experto',
  tagline: 'Pilota una nave interestelar a través de un denso cinturón de asteroides y recolecta orbes cósmicos.',
  instruction: '¡Usa los controles de vuelo para esquivar los asteroides flotantes!',
  article: {
    lore: 'El sector Kepler-186 alberga restos planetarios ricos en energía oscura cristalizada, codiciada por todos los pilotos del cuadrante.',
    mechanics: 'Vuela con aceleración continua. Maniobra en los ejes horizontal y vertical para evitar colisiones con las masas rocosas y absorbe los orbes dorados.',
    tips: [
      'Los asteroides rotan con inercias variables; vigila sus vértices.',
      'Mantenerte en el centro te da mayor margen de maniobra en emergencias.',
      'En el modo Frenesí de 10s, sobrevivir sin chocar duplica tus canicas ganadas.',
    ],
  },
  controlsDescription: {
    desktop: 'Flechas / WASD para moverte en 3D',
    mobile: 'D-Pad táctil para cabeceo y viraje',
  },
  icon: 'Compass',
  color: '#38BDF8',
  accentColor: '#EC4899',
  unlockedByDefault: false,
  unlockCost: 50,
  Component: AsteroidDrift3DView,
};
