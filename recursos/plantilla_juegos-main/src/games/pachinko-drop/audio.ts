import { soundManager } from '../../services/soundManager';

export const pachinkoAudio = {
  playLaunch: () => {
    soundManager.playJump();
  },
  playPinHit: (pinIndex = 0) => {
    soundManager.playPinBounce(pinIndex);
  },
  playSlotWin: (multiplier = 1) => {
    if (multiplier >= 10) {
      soundManager.playFanfare();
    } else {
      soundManager.playMarbleCollect(multiplier);
    }
  },
  playSlotDrain: () => {
    soundManager.playClick('A2');
  },
};
