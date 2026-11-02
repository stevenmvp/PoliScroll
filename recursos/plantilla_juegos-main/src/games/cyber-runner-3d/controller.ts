import { type RunnerState, type Obstacle3D, type Marble3D, type ObstacleType, OBJECTIVE_POOL } from './model';
import { runnerAudio } from './audio';

const LANE_WIDTH = 2.2;
const GRAVITY = -38;
const JUMP_FORCE = 14.5;
const DUCK_DURATION = 0.65;

export class RunnerController {
  private nextObstacleZ = -28;
  private nextMarbleZ = -12;
  private idCounter = 1;
  private objectiveIndex = 0;

  public moveLeft(state: RunnerState): void {
    if (state.gameOver) return;
    if (state.playerLane > -1) {
      state.playerLane -= 1;
      state.targetX = state.playerLane * LANE_WIDTH;
      runnerAudio.playLaneSwitch();
    }
  }

  public moveRight(state: RunnerState): void {
    if (state.gameOver) return;
    if (state.playerLane < 1) {
      state.playerLane += 1;
      state.targetX = state.playerLane * LANE_WIDTH;
      runnerAudio.playLaneSwitch();
    }
  }

  public jump(state: RunnerState): void {
    if (state.gameOver) return;
    if (!state.isJumping) {
      state.isJumping = true;
      state.isDucking = false;
      state.duckTimer = 0;
      state.velocityY = JUMP_FORCE;
      runnerAudio.playJump();
    }
  }

  public duck(state: RunnerState): void {
    if (state.gameOver) return;
    state.isDucking = true;
    state.duckTimer = DUCK_DURATION;
    // Fast drop if jumping
    if (state.isJumping) {
      state.velocityY = -22;
    }
    runnerAudio.playDuck();
  }

  public advanceObjectiveProgress(state: RunnerState, type: 'dodge' | 'marbles' | 'rings' | 'duck' | 'combo', amount = 1): void {
    if (state.activeObjective.type === type && !state.activeObjective.completed) {
      state.activeObjective.current += amount;
      if (state.activeObjective.current >= state.activeObjective.target) {
        state.activeObjective.completed = true;
        state.marbles += state.activeObjective.rewardMarbles;
        state.score += state.activeObjective.rewardPoints;
        runnerAudio.playObjectiveComplete();

        state.objectiveBanner = `¡Misión Cumplida! +${state.activeObjective.rewardMarbles} Canicas (+${state.activeObjective.rewardPoints} pts)`;

        setTimeout(() => {
          this.objectiveIndex = (this.objectiveIndex + 1) % OBJECTIVE_POOL.length;
          state.activeObjective = {
            ...OBJECTIVE_POOL[this.objectiveIndex],
            current: 0,
            completed: false,
          };
          state.objectiveBanner = null;
        }, 3200);
      }
    }
  }

  public update(state: RunnerState, delta: number, onCrash?: () => void): void {
    if (state.gameOver) return;

    // Smooth lane interpolation
    state.currentX += (state.targetX - state.currentX) * Math.min(1, delta * 15);

    // Jump physics
    if (state.isJumping) {
      state.playerY += state.velocityY * delta;
      state.velocityY += GRAVITY * delta;
      if (state.playerY <= 0) {
        state.playerY = 0;
        state.velocityY = 0;
        state.isJumping = false;
      }
    }

    // Duck timer decay
    if (state.isDucking) {
      state.duckTimer -= delta;
      if (state.duckTimer <= 0) {
        state.isDucking = false;
        state.duckTimer = 0;
      }
    }

    // Hyper Speed Decay
    if (state.hyperSpeedTimer > 0) {
      state.hyperSpeedTimer -= delta;
    }

    // Progressive speed scaling based on distance + hyper speed
    const distanceBoost = Math.min(22, state.distance * 0.03);
    const hyperBoost = state.hyperSpeedTimer > 0 ? 16 : 0;
    state.speed = state.baseSpeed + distanceBoost + hyperBoost;

    // Advance distance & score (multiplied by combo)
    const distTraveled = state.speed * delta;
    state.distance += distTraveled;
    state.multiplier = Math.min(5, 1 + Math.floor(state.combo / 3));
    state.score += Math.floor(distTraveled * 3 * state.multiplier);

    // Spawn varied obstacles (frequency increases with distance)
    const spawnInterval = Math.max(14, 26 - state.distance * 0.015);
    if (state.distance > this.nextObstacleZ + 40) {
      this.spawnDynamicObstacle(state);
      this.nextObstacleZ = state.distance + spawnInterval + Math.random() * 8;
    }

    // Spawn marbles
    if (state.distance > this.nextMarbleZ + 25) {
      const lane = Math.floor(Math.random() * 3) - 1;
      state.marbleItems.push({
        id: this.idCounter++,
        lane,
        z: -65,
        collected: false,
      });
      this.nextMarbleZ = state.distance + 10 + Math.random() * 12;
    }

    // Update obstacles
    for (let i = state.obstacles.length - 1; i >= 0; i--) {
      const obs = state.obstacles[i];
      obs.z += state.speed * delta;

      // Update patrol drone movement
      if (obs.type === 'drone') {
        obs.droneOffset = (obs.droneOffset || 0) + (obs.droneDir || 1) * delta * 2.2;
        if (Math.abs(obs.droneOffset) > 1.8) {
          obs.droneDir = -(obs.droneDir || 1);
        }
      }

      // Check speed ring collection
      if (obs.type === 'speed_ring' && !obs.passed) {
        const ringX = obs.lane * LANE_WIDTH;
        const xDist = Math.abs(state.currentX - ringX);
        const zDist = Math.abs(obs.z);

        if (zDist < 1.0 && xDist < 1.1) {
          obs.passed = true;
          state.hyperSpeedTimer = 2.5;
          state.score += 250 * state.multiplier;
          state.combo += 1;
          runnerAudio.playTurboRing();
          this.advanceObjectiveProgress(state, 'rings', 1);
          this.advanceObjectiveProgress(state, 'combo', state.combo);
        }
      }

      // Collision detection (Player is at z = 0, currentX, playerY)
      if (!obs.passed) {
        const zDist = Math.abs(obs.z);

        if (zDist < 1.0) {
          let hit = false;

          if (obs.type === 'barrier') {
            const obsX = obs.lane * LANE_WIDTH;
            const xDist = Math.abs(state.currentX - obsX);
            if (xDist < 0.95 && state.playerY < 0.7) {
              hit = true;
            }
          } else if (obs.type === 'high_laser') {
            const obsX = obs.lane * LANE_WIDTH;
            const xDist = Math.abs(state.currentX - obsX);
            // Must duck under high laser (or be jumping over pillar, or change lane)
            if (xDist < 1.0 && !state.isDucking) {
              hit = true;
            } else if (xDist < 1.0 && state.isDucking) {
              // Successfully ducked!
              this.advanceObjectiveProgress(state, 'duck', 1);
            }
          } else if (obs.type === 'drone') {
            const droneX = obs.lane * LANE_WIDTH + (obs.droneOffset || 0);
            const xDist = Math.abs(state.currentX - droneX);
            if (xDist < 0.9 && state.playerY < 0.8) {
              hit = true;
            }
          } else if (obs.type === 'double_gate') {
            const blocked = obs.blockedLanes || [-1, 0];
            const inBlockedLane = blocked.some((bLane) => {
              const bX = bLane * LANE_WIDTH;
              return Math.abs(state.currentX - bX) < 0.95;
            });
            if (inBlockedLane && state.playerY < 0.85) {
              hit = true;
            }
          }

          if (hit) {
            obs.passed = true;
            state.lives -= 1;
            state.combo = 0;
            state.multiplier = 1;
            runnerAudio.playCrash();
            if (onCrash) onCrash();
            if (state.lives <= 0) {
              state.gameOver = true;
            }
          } else if (zDist < 0.4 && !obs.nearMissAwarded && obs.type !== 'speed_ring') {
            // Near-Miss Reward!
            obs.nearMissAwarded = true;
            state.nearMissCount += 1;
            state.combo += 1;
            state.score += 150 * state.multiplier;
            state.nearMissAlert = `¡ROCE PELIGROSO! +${150 * state.multiplier} PTS`;
            runnerAudio.playNearMiss();
            this.advanceObjectiveProgress(state, 'dodge', 1);
            this.advanceObjectiveProgress(state, 'combo', state.combo);
            setTimeout(() => {
              state.nearMissAlert = null;
            }, 1200);
          }
        }
      }

      if (obs.z > 14) {
        state.obstacles.splice(i, 1);
      }
    }

    // Update marbles
    for (let i = state.marbleItems.length - 1; i >= 0; i--) {
      const m = state.marbleItems[i];
      m.z += state.speed * delta;

      const mX = m.lane * LANE_WIDTH;
      const xDist = Math.abs(state.currentX - mX);
      const zDist = Math.abs(m.z);

      if (zDist < 1.2 && xDist < 1.0 && !m.collected) {
        m.collected = true;
        state.marbles += 1;
        state.combo += 1;
        state.score += 60 * state.multiplier;
        runnerAudio.playMarblePickup(state.marbles);
        this.advanceObjectiveProgress(state, 'marbles', 1);
        this.advanceObjectiveProgress(state, 'combo', state.combo);
      }

      if (m.z > 12 || m.collected) {
        state.marbleItems.splice(i, 1);
      }
    }
  }

  private spawnDynamicObstacle(state: RunnerState): void {
    const rand = Math.random();
    let type: ObstacleType = 'barrier';
    let lane = Math.floor(Math.random() * 3) - 1;
    let blockedLanes: number[] | undefined;

    if (rand < 0.35) {
      type = 'barrier'; // standard hurdle
    } else if (rand < 0.55) {
      type = 'high_laser'; // must duck
    } else if (rand < 0.75) {
      type = 'drone'; // dynamic moving drone
    } else if (rand < 0.90) {
      // Double Gate: leaves only 1 lane open
      type = 'double_gate';
      const openLane = Math.floor(Math.random() * 3) - 1;
      blockedLanes = [-1, 0, 1].filter((l) => l !== openLane);
      lane = (blockedLanes[0] + blockedLanes[1]) / 2;
    } else {
      type = 'speed_ring'; // turbo boost ring
    }

    const newObs: Obstacle3D = {
      id: this.idCounter++,
      lane,
      z: -70,
      type,
      passed: false,
      droneOffset: 0,
      droneDir: Math.random() > 0.5 ? 1 : -1,
      blockedLanes,
    };
    state.obstacles.push(newObs);
  }
}
