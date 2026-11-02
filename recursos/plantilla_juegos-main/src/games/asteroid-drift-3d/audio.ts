import { soundManager } from '../../services/soundManager';

export const asteroidDriftAudio = {
  playThrusterBank: () => {
    soundManager.playClick('G3');
  },
  playOrbCollect: (idx = 0) => {
    soundManager.playMarbleCollect(idx);
  },
  playAsteroidCrash: () => {
    soundManager.playHit();
  },
};
