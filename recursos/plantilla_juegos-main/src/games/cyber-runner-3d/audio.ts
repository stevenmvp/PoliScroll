import { soundManager } from '../../services/soundManager';

export const runnerAudio = {
  playLaneSwitch: () => {
    soundManager.playClick('E4');
  },
  playJump: () => {
    soundManager.playJump();
  },
  playDuck: () => {
    soundManager.playClick('A2');
  },
  playMarblePickup: (index = 0) => {
    soundManager.playMarbleCollect(index);
  },
  playTurboRing: () => {
    soundManager.playMarbleCollect(5);
  },
  playNearMiss: () => {
    soundManager.playClick('D5');
  },
  playObjectiveComplete: () => {
    soundManager.playFanfare();
  },
  playCrash: () => {
    soundManager.playHit();
  },
};
