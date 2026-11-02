import { type GameDefinition } from '../../types/game';
import { ChronoMatrixTapView } from './view';

export const ChronoMatrixTapGame: GameDefinition = {
  id: 'chrono-matrix-tap',
  title: 'Chrono Matrix Tap',
  dimension: '2d',
  category: 'logic',
  difficulty: 'facil',
  tagline: 'Desafío de agilidad cognitiva y memoria: presiona los dígitos en secuencia ascendente antes de que se agote el tiempo.',
  instruction: '¡Toca los números del 1 al 9 en orden antes de que el reloj llegue a cero!',
  article: {
    lore: 'El procesador cuántico de la terminal requiere recalibraciones manuales ultrarrápidas para evitar la sobrecarga del reactor.',
    mechanics: 'Una cuadrícula de 9 números desordenados se presenta en cada ronda. Localiza y pulsa secuencialmente del 1 al 9. Cada acierto suma puntos y extiende el tiempo.',
    tips: [
      'Mira el indicador central para saber qué número sigue en todo momento.',
      'Completar una cuadrícula completa otorga 2 canicas y reinicia con una disposición aleatoria.',
      'Cuidado con tocar el número equivocado: te costará 1 segundo del cronómetro.',
    ],
  },
  controlsDescription: {
    desktop: 'Clic con el ratón sobre cada número',
    mobile: 'Toca directamente las celdas en la pantalla',
  },
  icon: 'Layers',
  color: '#10B981',
  accentColor: '#06B6D4',
  unlockedByDefault: false,
  unlockCost: 50,
  Component: ChronoMatrixTapView,
};
