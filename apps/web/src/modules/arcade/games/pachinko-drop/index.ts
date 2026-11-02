import { type GameDefinition } from '../../types/game';
import { PachinkoDropView } from './view';

export const PachinkoDropGame: GameDefinition = {
  id: 'pachinko-drop',
  title: 'Pachinko Drop',
  dimension: '2d',
  category: 'reflex',
  difficulty: 'facil',
  tagline: 'Lanza tus canicas en el tablero vertical de clavijas para multiplicar tu fortuna en las ranuras de bonificación.',
  instruction: '¡Ajusta la fuerza del resorte y dispara para acertar en la casilla JACKPOT x10!',
  article: {
    lore: 'Inspirado en los legendarios salones de Tokio, este dispositivo electromagnético canaliza el flujo del azar en cascada continua.',
    mechanics: 'Cada canica lanzada colisiona físicamente contra docenas de clavijas de acero, rebotando caóticamente hasta depositarse en los pozos multiplicadores (x1, x2, x3 o x10 Jackpot).',
    tips: [
      'Una fuerza media de lanzamiento suele distribuir la canica hacia el centro, donde aguarda el JACKPOT x10.',
      'Todas las canicas ganadas se suman permanentemente a tu billetera para el Gachapón.',
      'Puedes lanzar múltiples canicas en rápida sucesión para provocar colisiones entre ellas.',
    ],
  },
  controlsDescription: {
    desktop: 'Ajusta el control deslizante y pulsa LANZAR',
    mobile: 'Toca el botón LANZAR en pantalla',
  },
  icon: 'CircleDot',
  color: '#F59E0B',
  accentColor: '#38BDF8',
  unlockedByDefault: true,
  unlockCost: 0,
  Component: PachinkoDropView,
};
