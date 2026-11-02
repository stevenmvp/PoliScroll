import { soundManager } from '../../services/soundManager';

export const slashAudio = {
  playSlashStrike: (combo = 1) => {
    soundManager.playSlash();
    if (combo % 3 === 0) {
      soundManager.playMarbleCollect(combo);
    }
  },
  playParryMiss: () => {
    soundManager.playHit();
  },
};
