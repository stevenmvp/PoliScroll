export interface MatrixCell {
  id: number;
  val: number;
  label: string;
  cleared: boolean;
  highlighted: boolean;
}

export interface ChronoMatrixState {
  score: number;
  combo: number;
  marbles: number;
  round: number;
  targetVal: number;
  maxVal: number;
  cells: MatrixCell[];
  gridSize: number; // 3x3 or 4x4
  roundTimeLeft: number;
  gameOver: boolean;
}

export function createInitialChronoMatrixState(): ChronoMatrixState {
  const cells: MatrixCell[] = [];
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);

  for (let i = 0; i < 9; i++) {
    cells.push({
      id: i,
      val: numbers[i],
      label: numbers[i].toString(),
      cleared: false,
      highlighted: false,
    });
  }

  return {
    score: 0,
    combo: 0,
    marbles: 0,
    round: 1,
    targetVal: 1,
    maxVal: 9,
    cells,
    gridSize: 3,
    roundTimeLeft: 7.0,
    gameOver: false,
  };
}
