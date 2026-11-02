export type SlashDirection = 'left' | 'right' | 'up' | 'down';

export interface SlashTarget {
  id: number;
  dir: SlashDirection;
  progress: number; // 0 (spawn) to 1.0 (strike zone) to >1.2 (miss)
  speed: number;
  hit: boolean;
  missed: boolean;
  scoreAwarded?: number;
  term: string;
  isCorrect: boolean;
  explanation: string;
  mistakenOrigin?: string;
}

export interface SlashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface PixelSlashState {
  score: number;
  combo: number;
  maxCombo: number;
  marbles: number;
  lives: number;
  gameOver: boolean;
  targets: SlashTarget[];
  particles: SlashParticle[];
  activeSlashAnimation: { dir: SlashDirection; timer: number } | null;
}

export function createInitialPixelSlashState(): PixelSlashState {
  return {
    score: 0,
    combo: 0,
    maxCombo: 0,
    marbles: 0,
    lives: 3,
    gameOver: false,
    targets: [],
    particles: [],
    activeSlashAnimation: null,
  };
}
