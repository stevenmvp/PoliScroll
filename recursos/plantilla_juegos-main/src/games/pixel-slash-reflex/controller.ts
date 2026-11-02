import { type PixelSlashState, type SlashDirection, type SlashTarget, type SlashParticle } from './model';
import { slashAudio } from './audio';
import { SLASH_COLORS } from './assets';
import { academicStore } from '../../services/academicStore';

export class PixelSlashController {
  private timer = 0;
  private nextTargetTime = 0.6;
  private idCounter = 1;

  public slash(
    state: PixelSlashState,
    dir: SlashDirection,
    cx: number,
    cy: number,
    onHitCallback?: () => void,
    onMistakeCallback?: () => void
  ): boolean {
    if (state.gameOver) return false;

    // Trigger blade slash animation
    state.activeSlashAnimation = { dir, timer: 0.18 };

    // Find closest target in this direction within hit window [0.72 - 1.25]
    const candidates = state.targets.filter((t) => t.dir === dir && !t.hit && !t.missed);
    let bestTarget: SlashTarget | null = null;
    let minDiff = 999;

    for (const t of candidates) {
      const diff = Math.abs(t.progress - 1.0);
      if (diff < minDiff && diff < 0.35) {
        minDiff = diff;
        bestTarget = t;
      }
    }

    if (bestTarget) {
      bestTarget.hit = true;

      if (bestTarget.isCorrect) {
        // Correct Academic Concept Sliced!
        const isPerfect = minDiff < 0.12;
        const points = isPerfect ? 300 : 150;
        state.combo += 1;
        if (state.combo > state.maxCombo) state.maxCombo = state.combo;
        state.score += points * Math.min(5, 1 + Math.floor(state.combo / 3));

        if (state.combo % 4 === 0) {
          state.marbles += 1;
        }

        slashAudio.playSlashStrike(state.combo);
        academicStore.recordChoice({
          gameId: 'pixel-slash',
          concept: bestTarget.term,
          isCorrect: true,
          quickExplanation: bestTarget.explanation,
        });

        this.spawnParticles(state, cx, cy, isPerfect ? 24 : 14, '#10b981');
        if (onHitCallback) onHitCallback();
        return true;
      } else {
        // Slashed a Distractor! Penalty
        state.combo = 0;
        state.lives -= 1;
        slashAudio.playParryMiss();
        academicStore.recordChoice({
          gameId: 'pixel-slash',
          concept: bestTarget.term,
          isCorrect: false,
          mistakenOrigin: bestTarget.mistakenOrigin,
          quickExplanation: bestTarget.explanation,
        });

        this.spawnParticles(state, cx, cy, 18, '#ef4444');
        if (onMistakeCallback) onMistakeCallback();
        if (state.lives <= 0) {
          state.gameOver = true;
        }
        return false;
      }
    } else {
      // Whiff slash
      state.combo = 0;
      return false;
    }
  }

  private spawnParticles(state: PixelSlashState, cx: number, cy: number, count: number, customColor?: string): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 260;
      const color = customColor || SLASH_COLORS.sparkColors[Math.floor(Math.random() * SLASH_COLORS.sparkColors.length)];
      const p: SlashParticle = {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.3,
        color,
      };
      state.particles.push(p);
    }
  }

  public update(state: PixelSlashState, delta: number, onDamage?: () => void): void {
    if (state.gameOver) return;

    this.timer += delta;

    // Decay active slash animation
    if (state.activeSlashAnimation) {
      state.activeSlashAnimation.timer -= delta;
      if (state.activeSlashAnimation.timer <= 0) {
        state.activeSlashAnimation = null;
      }
    }

    // Spawn new directional target with active academic concept
    if (this.timer > this.nextTargetTime) {
      const directions: SlashDirection[] = ['left', 'right', 'up', 'down'];
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const speed = 0.75 + Math.min(0.65, this.timer * 0.025);

      const pool = academicStore.getRandomItemPool(2);
      const chosen = pool[0];

      const target: SlashTarget = {
        id: this.idCounter++,
        dir,
        progress: 0,
        speed,
        hit: false,
        missed: false,
        term: chosen.term,
        isCorrect: chosen.isCorrect,
        explanation: chosen.explanation,
        mistakenOrigin: chosen.mistakenOrigin,
      };
      state.targets.push(target);
      this.nextTargetTime = this.timer + Math.max(0.6, 1.25 - this.timer * 0.02);
    }

    // Advance targets toward center strike zone
    for (let i = state.targets.length - 1; i >= 0; i--) {
      const t = state.targets[i];
      t.progress += t.speed * delta;

      // Missed strike window
      if (t.progress > 1.25 && !t.hit && !t.missed) {
        t.missed = true;

        if (t.isCorrect) {
          // Missed a valid concept! Penalty
          state.lives -= 1;
          state.combo = 0;
          slashAudio.playParryMiss();
          if (onDamage) onDamage();
          if (state.lives <= 0) {
            state.gameOver = true;
          }
        }
        // If it was a distractor, letting it pass was the right call!
      }

      // Remove offscreen
      if (t.progress > 1.4 || t.hit) {
        state.targets.splice(i, 1);
      }
    }

    // Update particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.life -= delta;
      if (p.life <= 0) {
        state.particles.splice(i, 1);
      }
    }
  }
}
