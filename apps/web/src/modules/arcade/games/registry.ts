import { type GameDefinition, type GameCategory } from '../types/game';
import { CyberRunnerGame } from './cyber-runner-3d';
import { NeonOrbitBeatGame } from './neon-orbit-beat';
import { PixelSlashReflexGame } from './pixel-slash-reflex';
import { AsteroidDrift3DGame } from './asteroid-drift-3d';
import { ChronoMatrixTapGame } from './chrono-matrix-tap';
import { PachinkoDropGame } from './pachinko-drop';
import { FroggerRushGame } from './frogger-rush';
import { BridgeBuilderGame } from './bridge-builder';
import { ChickenHopGame } from './chicken-hop';
import { FlappyCyberGame } from './flappy-cyber';
import { TriviaSuiteGame } from './trivia-suite';
import { PatternMemoryGame } from './pattern-memory';
import { ShelfOrganizerGame } from './shelf-organizer';
import { SynapseBeatRushGame } from './synapse-beat-rush';
import { VelocitySonicDriftGame } from './velocity-sonic-drift';
import { LogicCircuitDeductorGame } from './logic-circuit-deductor';

export const ALL_GAMES: GameDefinition[] = [
  SynapseBeatRushGame,
  VelocitySonicDriftGame,
  LogicCircuitDeductorGame,
  CyberRunnerGame,
  FroggerRushGame,
  BridgeBuilderGame,
  ChickenHopGame,
  FlappyCyberGame,
  NeonOrbitBeatGame,
  PixelSlashReflexGame,
  AsteroidDrift3DGame,
  TriviaSuiteGame,
  PatternMemoryGame,
  ShelfOrganizerGame,
  ChronoMatrixTapGame,
  PachinkoDropGame,
];

export function getAllGames(): GameDefinition[] {
  return ALL_GAMES;
}

export function getGameById(id: string): GameDefinition | undefined {
  return ALL_GAMES.find((g) => g.id === id);
}

export function getGamesByCategory(category: GameCategory): GameDefinition[] {
  if (category === 'all') return ALL_GAMES;
  return ALL_GAMES.filter((g) => g.category === category);
}

export function getRandomGameForFrenzy(excludeId?: string): GameDefinition {
  const eligible = ALL_GAMES.filter((g) => g.id !== excludeId && g.id !== 'pachinko-drop');
  if (eligible.length === 0) return ALL_GAMES[0];
  const idx = Math.floor(Math.random() * eligible.length);
  return eligible[idx];
}
