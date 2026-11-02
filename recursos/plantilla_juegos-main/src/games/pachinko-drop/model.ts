export interface PachinkoPin {
  id: number;
  x: number;
  y: number;
  radius: number;
  isRotatingSpinner?: boolean;
  angle?: number;
  spinSpeed?: number;
}

export interface PachinkoOscillatingBumper {
  id: number;
  y: number;
  baseX: number;
  width: number;
  height: number;
  amplitude: number;
  speed: number;
  phase: number;
  currentX: number;
}

export interface PachinkoRingPocket {
  id: number;
  x: number;
  y: number;
  radius: number;
  label: string;
  marblesReward: number;
  color: string;
  glow: string;
  isJackpot?: boolean;
}

export interface PachinkoMarble {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glow: string;
  settled: boolean;
  scoreAwarded?: number;
}

export interface PachinkoBottomSlot {
  id: number;
  x: number;
  width: number;
  label: string;
  marblesReward: number;
  color: string;
}

export interface PachinkoState {
  marblesAvailable: number;
  score: number;
  marblesEarned: number;
  marblesInFlight: PachinkoMarble[];
  pins: PachinkoPin[];
  bumpers: PachinkoOscillatingBumper[];
  ringPockets: PachinkoRingPocket[];
  bottomSlots: PachinkoBottomSlot[];
  selectedLauncher: 'left' | 'right';
  chargePower: number; // 0 - 100
  isCharging: boolean;
  launcherAngle: number;
  lastReward: { label: string; amount: number; color: string } | null;
  gameOver: boolean;
}

export function createInitialPachinkoState(): PachinkoState {
  const pins: PachinkoPin[] = [];
  let pinId = 1;
  const rows = 8;
  const startY = 135;
  const spacingY = 32;
  const spacingX = 36;
  const boardWidth = 380;

  for (let r = 0; r < rows; r++) {
    const isEven = r % 2 === 0;
    const cols = isEven ? 9 : 8;
    const startX = isEven ? 46 : 64;

    for (let c = 0; c < cols; c++) {
      const px = startX + c * spacingX;
      const py = startY + r * spacingY;

      // Reserve space for oscillating bumpers and jackpot rings
      const nearCenterPocket = Math.hypot(px - boardWidth / 2, py - 355) < 32;
      const nearLeftPocket = Math.hypot(px - 95, py - 325) < 28;
      const nearRightPocket = Math.hypot(px - (boardWidth - 95), py - 325) < 28;
      const nearBumper1 = Math.abs(py - 225) < 18 && Math.abs(px - boardWidth / 2) < 70;

      if (!nearCenterPocket && !nearLeftPocket && !nearRightPocket && !nearBumper1) {
        // Designate some pins in row 3 and 5 as rotating deflection spinners
        const isSpinner = (r === 2 && (c === 2 || c === 6)) || (r === 4 && (c === 1 || c === 7));
        pins.push({
          id: pinId++,
          x: px,
          y: py,
          radius: isSpinner ? 6.5 : 3.8,
          isRotatingSpinner: isSpinner,
          angle: 0,
          spinSpeed: isSpinner ? 2.5 + (c % 2 === 0 ? 1 : -1) * 1.5 : 0,
        });
      }
    }
  }

  // 2 Horizontal Oscillating Deflection Bumpers in mid-board
  const bumpers: PachinkoOscillatingBumper[] = [
    {
      id: 1,
      y: 225,
      baseX: boardWidth / 2,
      width: 65,
      height: 12,
      amplitude: 55,
      speed: 1.8,
      phase: 0,
      currentX: boardWidth / 2,
    },
    {
      id: 2,
      y: 290,
      baseX: boardWidth / 2,
      width: 50,
      height: 10,
      amplitude: 45,
      speed: -2.2,
      phase: Math.PI / 2,
      currentX: boardWidth / 2,
    },
  ];

  // Circular Target Ring Pockets (Penultimate and 7th lines, high value jackpot spots)
  const ringPockets: PachinkoRingPocket[] = [
    {
      id: 101,
      x: boardWidth / 2,
      y: 355,
      radius: 19,
      label: 'JACKPOT +25 CANICAS',
      marblesReward: 25,
      color: '#F59E0B',
      glow: 'rgba(245, 158, 11, 0.95)',
      isJackpot: true,
    },
    {
      id: 102,
      x: 95,
      y: 325,
      radius: 16,
      label: '+8 CANICAS',
      marblesReward: 8,
      color: '#06B6D4',
      glow: 'rgba(6, 182, 212, 0.85)',
    },
    {
      id: 103,
      x: boardWidth - 95,
      y: 325,
      radius: 16,
      label: '+8 CANICAS',
      marblesReward: 8,
      color: '#8B5CF6',
      glow: 'rgba(139, 92, 246, 0.85)',
    },
  ];

  // Minor Bottom Slots (2 Empty Drains + 1 Small Recover Slot)
  const bottomSlots: PachinkoBottomSlot[] = [
    { id: 1, x: 25, width: 100, label: '0 Canicas (Vacío)', marblesReward: 0, color: '#64748b' },
    { id: 2, x: 135, width: 110, label: '+1 Canica (Recupera)', marblesReward: 1, color: '#0ea5e9' },
    { id: 3, x: 255, width: 100, label: '0 Canicas (Vacío)', marblesReward: 0, color: '#64748b' },
  ];

  return {
    marblesAvailable: 15,
    score: 0,
    marblesEarned: 0,
    marblesInFlight: [],
    pins,
    bumpers,
    ringPockets,
    bottomSlots,
    selectedLauncher: 'right',
    chargePower: 0,
    isCharging: false,
    launcherAngle: 0,
    lastReward: null,
    gameOver: false,
  };
}
