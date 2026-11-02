export interface Asteroid3D {
  id: number;
  x: number;
  y: number;
  z: number;
  radius: number;
  rotX: number;
  rotY: number;
  speed: number;
}

export interface CosmicOrb3D {
  id: number;
  x: number;
  y: number;
  z: number;
  collected: boolean;
}

export interface AsteroidDriftState {
  shipX: number;
  shipY: number;
  targetShipX: number;
  targetShipY: number;
  speed: number;
  distance: number;
  score: number;
  marbles: number;
  lives: number;
  gameOver: boolean;
  asteroids: Asteroid3D[];
  orbs: CosmicOrb3D[];
}

export function createInitialAsteroidDriftState(): AsteroidDriftState {
  return {
    shipX: 0,
    shipY: 0,
    targetShipX: 0,
    targetShipY: 0,
    speed: 35,
    distance: 0,
    score: 0,
    marbles: 0,
    lives: 3,
    gameOver: false,
    asteroids: [],
    orbs: [],
  };
}
