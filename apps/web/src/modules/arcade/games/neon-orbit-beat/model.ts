export interface OrbitHazard {
  id: number;
  orbitIndex: number; // 0 (inner), 1 (mid), 2 (outer)
  angle: number; // in radians
  span: number;
  speed: number;
}

export interface BeatNote {
  id: number;
  orbitIndex: number;
  angle: number;
  collected: boolean;
  value: number;
  term: string;
  isCorrect: boolean;
  explanation: string;
  mistakenOrigin?: string;
}

export interface OrbitBeatState {
  playerOrbit: number; // 0, 1, 2
  playerAngle: number;
  angularSpeed: number;
  bpm: number;
  score: number;
  combo: number;
  maxCombo: number;
  marbles: number;
  lives: number;
  gameOver: boolean;
  beatPhase: number;
  hazards: OrbitHazard[];
  notes: BeatNote[];
}

export function createInitialOrbitBeatState(): OrbitBeatState {
  return {
    playerOrbit: 1, // Start on middle orbit
    playerAngle: 0,
    angularSpeed: 2.2,
    bpm: 128,
    score: 0,
    combo: 0,
    maxCombo: 0,
    marbles: 0,
    lives: 3,
    gameOver: false,
    beatPhase: 0,
    hazards: [],
    notes: [],
  };
}
