import { soundManager } from '../../services/soundManager';

export const chronoAudio = {
  playCorrectTap: (step = 1) => {
    soundManager.playClick(['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5'][step % 9]);
  },
  playWrongTap: () => {
    soundManager.playHit();
  },
  playRoundClear: () => {
    soundManager.playMarbleCollect(3);
  },
};
