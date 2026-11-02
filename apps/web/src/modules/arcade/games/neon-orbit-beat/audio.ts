import { soundManager } from '../../services/soundManager';

export const orbitBeatAudio = {
  playOrbitJump: () => {
    soundManager.playClick('A4');
  },
  playNoteHit: (combo = 1) => {
    soundManager.playMarbleCollect(combo);
  },
  playBeatPulse: () => {
    soundManager.playClick('C2');
  },
  playMiss: () => {
    soundManager.playHit();
  },
};
