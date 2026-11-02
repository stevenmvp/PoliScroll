export type ObstacleType = 'barrier' | 'high_laser' | 'drone' | 'double_gate' | 'speed_ring';

export interface Obstacle3D {
  id: number;
  lane: number; // -1, 0, 1
  z: number;
  type: ObstacleType;
  passed: boolean;
  nearMissAwarded?: boolean;
  // For drones that patrol
  droneOffset?: number;
  droneDir?: number;
  // For double gates (e.g. [-1, 0] or [0, 1])
  blockedLanes?: number[];
}

export interface Marble3D {
  id: number;
  lane: number;
  z: number;
  collected: boolean;
}

export interface RunnerObjective {
  id: string;
  text: string;
  type: 'dodge' | 'marbles' | 'rings' | 'duck' | 'combo';
  current: number;
  target: number;
  rewardMarbles: number;
  rewardPoints: number;
  completed: boolean;
}

export interface RunnerState {
  playerLane: number; // -1, 0, 1
  targetX: number;
  currentX: number;
  playerY: number;
  velocityY: number;
  isJumping: boolean;
  isDucking: boolean;
  duckTimer: number;
  baseSpeed: number;
  speed: number;
  distance: number;
  score: number;
  marbles: number;
  lives: number;
  combo: number;
  maxCombo: number;
  multiplier: number;
  nearMissCount: number;
  hyperSpeedTimer: number;
  gameOver: boolean;
  obstacles: Obstacle3D[];
  marbleItems: Marble3D[];
  activeObjective: RunnerObjective;
  objectiveBanner: string | null;
  nearMissAlert: string | null;
  targetFps: 60 | 30;
  actualFps: number;
}

export const OBJECTIVE_POOL: Omit<RunnerObjective, 'current' | 'completed'>[] = [
  { id: 'dodge-6', text: 'Esquiva 6 obstáculos', type: 'dodge', target: 6, rewardMarbles: 3, rewardPoints: 500 },
  { id: 'marbles-6', text: 'Recolecta 6 canicas', type: 'marbles', target: 6, rewardMarbles: 4, rewardPoints: 600 },
  { id: 'rings-2', text: 'Atraviesa 2 anillos turbo', type: 'rings', target: 2, rewardMarbles: 5, rewardPoints: 800 },
  { id: 'duck-2', text: 'Deslízate bajo 2 láseres', type: 'duck', target: 2, rewardMarbles: 3, rewardPoints: 500 },
  { id: 'combo-3', text: 'Alcanza racha Combo x3', type: 'combo', target: 3, rewardMarbles: 6, rewardPoints: 1000 },
];

export function createInitialRunnerState(): RunnerState {
  const initialObjective: RunnerObjective = {
    ...OBJECTIVE_POOL[0],
    current: 0,
    completed: false,
  };

  return {
    playerLane: 0,
    targetX: 0,
    currentX: 0,
    playerY: 0,
    velocityY: 0,
    isJumping: false,
    isDucking: false,
    duckTimer: 0,
    baseSpeed: 32,
    speed: 32,
    distance: 0,
    score: 0,
    marbles: 0,
    lives: 3,
    combo: 0,
    maxCombo: 0,
    multiplier: 1,
    nearMissCount: 0,
    hyperSpeedTimer: 0,
    gameOver: false,
    obstacles: [],
    marbleItems: [],
    activeObjective: initialObjective,
    objectiveBanner: null,
    nearMissAlert: null,
    targetFps: 60,
    actualFps: 60,
  };
}
