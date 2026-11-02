import { type ChronoMatrixState, type MatrixCell } from './model';
import { chronoAudio } from './audio';

export class ChronoMatrixController {
  public tapCell(state: ChronoMatrixState, cell: MatrixCell, onRoundComplete?: () => void): boolean {
    if (state.gameOver || cell.cleared) return false;

    if (cell.val === state.targetVal) {
      cell.cleared = true;
      state.score += 100 * Math.min(5, 1 + state.combo);
      state.combo += 1;
      state.targetVal += 1;
      chronoAudio.playCorrectTap(state.targetVal);

      // Check if full round cleared!
      if (state.targetVal > state.maxVal) {
        state.round += 1;
        state.marbles += 2;
        chronoAudio.playRoundClear();
        this.nextRound(state);
        if (onRoundComplete) onRoundComplete();
      }
      return true;
    } else {
      // Wrong tap penalty
      state.combo = 0;
      state.roundTimeLeft = Math.max(0, state.roundTimeLeft - 1.0);
      chronoAudio.playWrongTap();
      return false;
    }
  }

  public nextRound(state: ChronoMatrixState): void {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    state.targetVal = 1;
    state.roundTimeLeft = Math.max(3.5, 7.0 - state.round * 0.3);
    state.cells = numbers.map((n, i) => ({
      id: i,
      val: n,
      label: n.toString(),
      cleared: false,
      highlighted: false,
    }));
  }

  public update(state: ChronoMatrixState, delta: number): void {
    if (state.gameOver) return;

    state.roundTimeLeft -= delta;
    if (state.roundTimeLeft <= 0) {
      state.roundTimeLeft = 0;
      state.gameOver = true;
    }
  }
}
