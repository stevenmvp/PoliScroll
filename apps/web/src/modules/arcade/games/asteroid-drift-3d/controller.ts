import { type AsteroidDriftState, type Asteroid3D, type CosmicOrb3D } from './model';
import { asteroidDriftAudio } from './audio';

export class AsteroidDriftController {
  private nextAsteroidZ = -30;
  private nextOrbZ = -15;
  private idCounter = 1;

  public steer(state: AsteroidDriftState, dx: number, dy: number): void {
    if (state.gameOver) return;
    state.targetShipX = Math.max(-4.5, Math.min(4.5, state.targetShipX + dx));
    state.targetShipY = Math.max(-2.8, Math.min(3.2, state.targetShipY + dy));
    asteroidDriftAudio.playThrusterBank();
  }

  public update(state: AsteroidDriftState, delta: number, onCrash?: () => void): void {
    if (state.gameOver) return;

    // Smooth ship position interpolation
    state.shipX += (state.targetShipX - state.shipX) * Math.min(1, delta * 8);
    state.shipY += (state.targetShipY - state.shipY) * Math.min(1, delta * 8);

    const distDelta = state.speed * delta;
    state.distance += distDelta;
    state.score += Math.floor(distDelta * 1.5);

    // Spawn Asteroids
    if (state.distance > this.nextAsteroidZ + 40) {
      const asteroid: Asteroid3D = {
        id: this.idCounter++,
        x: (Math.random() - 0.5) * 9,
        y: (Math.random() - 0.5) * 6,
        z: -70,
        radius: 1.0 + Math.random() * 0.8,
        rotX: (Math.random() - 0.5) * 2,
        rotY: (Math.random() - 0.5) * 2,
        speed: state.speed * (0.8 + Math.random() * 0.4),
      };
      state.asteroids.push(asteroid);
      this.nextAsteroidZ = state.distance + 12 + Math.random() * 10;
    }

    // Spawn Cosmic Orbs
    if (state.distance > this.nextOrbZ + 25) {
      const orb: CosmicOrb3D = {
        id: this.idCounter++,
        x: (Math.random() - 0.5) * 7,
        y: (Math.random() - 0.5) * 5,
        z: -65,
        collected: false,
      };
      state.orbs.push(orb);
      this.nextOrbZ = state.distance + 8 + Math.random() * 8;
    }

    // Update Asteroids
    for (let i = state.asteroids.length - 1; i >= 0; i--) {
      const a = state.asteroids[i];
      a.z += a.speed * delta;

      // Check collision (ship is at z=0, shipX, shipY)
      const dist = Math.hypot(state.shipX - a.x, state.shipY - a.y, a.z);
      if (dist < a.radius + 0.6) {
        state.asteroids.splice(i, 1);
        state.lives -= 1;
        asteroidDriftAudio.playAsteroidCrash();
        if (onCrash) onCrash();
        if (state.lives <= 0) {
          state.gameOver = true;
        }
        continue;
      }

      if (a.z > 15) {
        state.asteroids.splice(i, 1);
      }
    }

    // Update Cosmic Orbs
    for (let i = state.orbs.length - 1; i >= 0; i--) {
      const o = state.orbs[i];
      o.z += state.speed * delta;

      const dist = Math.hypot(state.shipX - o.x, state.shipY - o.y, o.z);
      if (dist < 1.4 && !o.collected) {
        o.collected = true;
        state.marbles += 1;
        state.score += 80;
        asteroidDriftAudio.playOrbCollect(state.marbles);
      }

      if (o.z > 10 || o.collected) {
        state.orbs.splice(i, 1);
      }
    }
  }
}
