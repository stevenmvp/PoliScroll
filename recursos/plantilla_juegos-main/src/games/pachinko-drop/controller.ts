import { type PachinkoState, type PachinkoMarble } from './model';
import { PACHINKO_CONFIG } from './assets';
import { pachinkoAudio } from './audio';

export class PachinkoController {
  private idCounter = 1;

  public setLauncherSide(state: PachinkoState, side: 'left' | 'right'): void {
    state.selectedLauncher = side;
  }

  public updateCharge(state: PachinkoState, delta: number): void {
    if (!state.isCharging) return;
    // Progressive charge
    state.chargePower = Math.min(100, state.chargePower + delta * 90);
  }

  public launchChargedMarble(
    state: PachinkoState,
    skinColor = '#F59E0B',
    skinGlow = 'rgba(245, 158, 11, 0.7)'
  ): boolean {
    if (state.marblesAvailable <= 0) {
      state.isCharging = false;
      state.chargePower = 0;
      return false;
    }

    state.marblesAvailable -= 1;
    const powerRatio = Math.max(0.25, state.chargePower / 100);

    // Marble launches clearly from the TOP launcher funnel at y = 28
    const isLeft = state.selectedLauncher === 'left';
    const startX = isLeft ? 55 : PACHINKO_CONFIG.boardWidth - 55;
    const startY = 28;

    // Angle shoots inward and down toward board center in a crisp trajectory
    const horizontalDirection = isLeft ? 1 : -1;
    const vx = horizontalDirection * (70 + powerRatio * 160);
    const vy = 40 + powerRatio * 120; // downward initial speed

    const marble: PachinkoMarble = {
      id: this.idCounter++,
      x: startX,
      y: startY,
      vx,
      vy,
      radius: 6.5,
      color: skinColor,
      glow: skinGlow,
      settled: false,
    };

    state.marblesInFlight.push(marble);
    state.isCharging = false;
    state.chargePower = 0;
    pachinkoAudio.playLaunch();
    return true;
  }

  public update(
    state: PachinkoState,
    delta: number,
    onReward?: (marblesWon: number, isJackpot: boolean) => void
  ): void {
    const { boardWidth, boardHeight, gravity, restitution, pinFriction } = PACHINKO_CONFIG;

    // 1. Update Rotating Spinner Pins
    for (const pin of state.pins) {
      if (pin.isRotatingSpinner && pin.spinSpeed) {
        pin.angle = ((pin.angle || 0) + pin.spinSpeed * delta) % (Math.PI * 2);
      }
    }

    // 2. Update Horizontal Oscillating Bumpers
    for (const bumper of state.bumpers) {
      bumper.phase += bumper.speed * delta;
      bumper.currentX = bumper.baseX + Math.sin(bumper.phase) * bumper.amplitude;
    }

    // 3. Update Marbles in Flight
    for (let i = state.marblesInFlight.length - 1; i >= 0; i--) {
      const m = state.marblesInFlight[i];
      if (m.settled) continue;

      // Gravity and motion
      m.vy += gravity * delta;
      m.x += m.vx * delta;
      m.y += m.vy * delta;

      // Top ceiling containment
      if (m.y < 20) {
        m.y = 20;
        m.vy = Math.abs(m.vy) * restitution;
      }

      // Side Walls
      if (m.x - m.radius < 14) {
        m.x = 14 + m.radius;
        m.vx = -m.vx * restitution;
      } else if (m.x + m.radius > boardWidth - 14) {
        m.x = boardWidth - 14 - m.radius;
        m.vx = -m.vx * restitution;
      }

      // Collisions with Horizontal Oscillating Bumpers
      for (const bumper of state.bumpers) {
        const halfW = bumper.width / 2;
        const halfH = bumper.height / 2;
        const bLeft = bumper.currentX - halfW;
        const bRight = bumper.currentX + halfW;
        const bTop = bumper.y - halfH;
        const bBottom = bumper.y + halfH;

        if (
          m.x + m.radius > bLeft &&
          m.x - m.radius < bRight &&
          m.y + m.radius > bTop &&
          m.y - m.radius < bBottom
        ) {
          // Bumper deflection bounce
          m.vy = -Math.abs(m.vy) * 1.15;
          m.vx += (m.x - bumper.currentX) * 3.5;
          pachinkoAudio.playPinHit(bumper.id + 999);
        }
      }

      // Circular Ring Pockets (Jackpot & High Value Marbles)
      let capturedInPocket = false;
      for (const pocket of state.ringPockets) {
        const dx = m.x - pocket.x;
        const dy = m.y - pocket.y;
        const dist = Math.hypot(dx, dy);

        if (dist < pocket.radius) {
          m.settled = true;
          capturedInPocket = true;

          const marblesWon = pocket.marblesReward;
          state.score += marblesWon * 100;
          state.marblesEarned += marblesWon;
          state.marblesAvailable += marblesWon;

          state.lastReward = {
            label: pocket.label,
            amount: marblesWon,
            color: pocket.color,
          };

          pachinkoAudio.playSlotWin(marblesWon);
          if (onReward) onReward(marblesWon, !!pocket.isJackpot);

          state.marblesInFlight.splice(i, 1);
          break;
        }
      }
      if (capturedInPocket) continue;

      // Pin Collisions
      for (const pin of state.pins) {
        const dx = m.x - pin.x;
        const dy = m.y - pin.y;
        const dist = Math.hypot(dx, dy);
        const minDist = m.radius + pin.radius;

        if (dist < minDist) {
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);

          m.x = pin.x + nx * minDist;
          m.y = pin.y + ny * minDist;

          const dot = m.vx * nx + m.vy * ny;
          m.vx = (m.vx - 2 * dot * nx) * restitution * pinFriction;
          m.vy = (m.vy - 2 * dot * ny) * restitution * pinFriction;

          // If rotating spinner pin, add angular kick
          if (pin.isRotatingSpinner && pin.spinSpeed) {
            m.vx += pin.spinSpeed * 25;
            m.vy += (Math.random() - 0.5) * 30;
          } else {
            m.vx += (Math.random() - 0.5) * 35;
          }

          pachinkoAudio.playPinHit(pin.id);
        }
      }

      // Bottom Collector Slots
      if (m.y > boardHeight - 30) {
        m.settled = true;
        const slot = state.bottomSlots.find((s) => m.x >= s.x && m.x <= s.x + s.width);
        const marblesWon = slot ? slot.marblesReward : 0;

        if (marblesWon > 0) {
          state.score += marblesWon * 50;
          state.marblesEarned += marblesWon;
          state.marblesAvailable += marblesWon;
          pachinkoAudio.playSlotWin(marblesWon);
        } else {
          pachinkoAudio.playSlotDrain();
        }

        state.lastReward = {
          label: slot ? slot.label : '0 Canicas',
          amount: marblesWon,
          color: slot ? slot.color : '#64748b',
        };

        if (onReward) onReward(marblesWon, false);
        state.marblesInFlight.splice(i, 1);
      }
    }
  }
}
