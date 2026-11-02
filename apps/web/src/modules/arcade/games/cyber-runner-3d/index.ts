import { type GameDefinition } from '../../types/game';
import { CyberRunnerView } from './view';

export const CyberRunnerGame: GameDefinition = {
  id: 'cyber-runner-3d',
  title: 'Cyber Runner 3D',
  dimension: '3d',
  category: '3d',
  difficulty: 'experto',
  tagline: 'Carrera a hipervelocidad: esquiva vallas, deslízate bajo láseres altos, esquiva drones y completa misiones activas.',
  instruction: '¡Salta obstáculos con Espacio, deslízate bajo láseres con S / Abajo y busca los anillos turbo!',
  article: {
    lore: 'En las arterias energéticas de Neo-Kyoto, los drones patrullan el tráfico a más de 50 km/h mientras los pilotos compiten por la supremacía cibernética.',
    mechanics: 'Muévete entre 3 carriles con A/D o flechas, salta vallas rojas con Espacio/Arriba y deslízate bajo los láseres magenta con S/Abajo. Atraviesa anillos dorados para activar hipervelocidad.',
    tips: [
      'Presiona S o Flecha Abajo para agacharte bajo los rayos láser altos.',
      'Rozar un obstáculo de cerca te da un bono de "Roce Peligroso" (+150 pts) y sube tu multiplicador de combo.',
      'Completa las misiones dinámicas que aparecen en pantalla para ganar ráfagas de canicas extra.',
      'Usa el interruptor de 60 FPS / 30 FPS en la esquina superior para adaptar el rendimiento a tu dispositivo.',
    ],
  },
  controlsDescription: {
    desktop: 'A/D (Carril), Espacio/W (Salto), S/Abajo (Deslizarse)',
    mobile: 'D-Pad táctil, botón SALTAR y botón DESLIZAR',
  },
  icon: 'Zap',
  color: '#8B5CF6',
  accentColor: '#06B6D4',
  unlockedByDefault: true,
  unlockCost: 0,
  Component: CyberRunnerView,
};
