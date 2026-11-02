import { type OrbitBeatState, type OrbitHazard, type BeatNote } from './model';
import { orbitBeatAudio } from './audio';
import { academicStore } from '../../services/academicStore';
import { soundManager } from '../../services/soundManager';

export class OrbitBeatController {
  private nextHazardTime = 1.2;
  private nextNoteTime = 0.6;
  private idCounter = 1;
  private timer = 0;

  public jumpOrbit(state: OrbitBeatState, direction: 'in' | 'out' | 'cycle'): void {
    if (state.gameOver) return;

    if (direction === 'in') {
      if (state.playerOrbit > 0) state.playerOrbit--;
    } else if (direction === 'out') {
      if (state.playerOrbit < 2) state.playerOrbit++;
    } else {
      // Cycle: 0 -> 1 -> 2 -> 0
      state.playerOrbit = (state.playerOrbit + 1) % 3;
    }
    orbitBeatAudio.playOrbitJump();
  }

  public update(state: OrbitBeatState, delta: number, onHit?: () => void): void {
    if (state.gameOver) return;

    this.timer += delta;
    state.playerAngle = (state.playerAngle + state.angularSpeed * delta) % (Math.PI * 2);

    // Beat pulsation
    const beatInterval = 60 / state.bpm;
    state.beatPhase = (this.timer % beatInterval) / beatInterval;

    // Spawn hazards
    if (this.timer > this.nextHazardTime) {
      const orbit = Math.floor(Math.random() * 3);
      const angle = (state.playerAngle + Math.PI * 0.9 + Math.random() * 0.5) % (Math.PI * 2);
      const hazard: OrbitHazard = {
        id: this.idCounter++,
        orbitIndex: orbit,
        angle,
        span: 0.5 + Math.random() * 0.35,
        speed: state.angularSpeed * 0.5 * (Math.random() > 0.5 ? 1 : -0.5),
      };
      state.hazards.push(hazard);
      this.nextHazardTime = this.timer + 1.4 + Math.random() * 1.0;
    }

    // Spawn academic harmonic notes
    if (this.timer > this.nextNoteTime) {
      const orbit = Math.floor(Math.random() * 3);
      const angle = (state.playerAngle + Math.PI * 0.75 + Math.random() * 0.6) % (Math.PI * 2);
      
      const academicItem = academicStore.getRandomItem();
      const note: BeatNote = {
        id: this.idCounter++,
        orbitIndex: orbit,
        angle,
        collected: false,
        value: 120,
        term: academicItem.term,
        isCorrect: academicItem.isCorrect,
        explanation: academicItem.explanation,
        mistakenOrigin: academicItem.mistakenOrigin,
      };
      state.notes.push(note);
      this.nextNoteTime = this.timer + 0.9 + Math.random() * 0.7;
    }

    // Update hazards
    for (let i = state.hazards.length - 1; i >= 0; i--) {
      const h = state.hazards[i];
      h.angle = (h.angle + h.speed * delta) % (Math.PI * 2);

      // Check collision if same orbit
      if (h.orbitIndex === state.playerOrbit) {
        let diff = Math.abs(state.playerAngle - h.angle);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;

        if (diff < h.span / 2) {
          state.hazards.splice(i, 1);
          state.lives -= 1;
          state.combo = 0;
          orbitBeatAudio.playMiss();
          if (onHit) onHit();
          if (state.lives <= 0) {
            state.gameOver = true;
          }
          continue;
        }
      }

      if (state.hazards.length > 6) {
        state.hazards.shift();
      }
    }

    // Update academic notes
    for (let i = state.notes.length - 1; i >= 0; i--) {
      const n = state.notes[i];
      if (n.orbitIndex === state.playerOrbit && !n.collected) {
        let diff = Math.abs(state.playerAngle - n.angle);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;

        if (diff < 0.28) {
          n.collected = true;

          // Record academic response
          academicStore.recordAnswer({
            gameId: 'neon-orbit-beat',
            term: n.term,
            isCorrect: n.isCorrect,
            explanation: n.explanation,
            mistakenOrigin: n.mistakenOrigin,
          });

          if (n.isCorrect) {
            // Valid academic resonance!
            state.combo += 1;
            if (state.combo > state.maxCombo) state.maxCombo = state.combo;
            const multiplier = Math.min(4, Math.floor(1 + state.combo / 4));
            state.score += n.value * multiplier;
            if (state.combo % 3 === 0) {
              state.marbles += 1;
            }
            soundManager.playCorrect();
            orbitBeatAudio.playNoteHit(state.combo);
          } else {
            // Distractor captured: disrupts resonance
            state.combo = 0;
            state.score = Math.max(0, state.score - 40);
            orbitBeatAudio.playMiss();
          }

          state.notes.splice(i, 1);
          continue;
        }
      }

      // Clean old notes to keep memory tight
      if (state.notes.length > 8) {
        state.notes.shift();
      }
    }
  }
}
