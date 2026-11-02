import React, { useEffect, useRef, useState, useCallback } from 'react';
import { type GameInstanceProps } from '../../types/game';
import { createInitialChronoMatrixState, type ChronoMatrixState, type MatrixCell } from './model';
import { ChronoMatrixController } from './controller';
import { Trophy, Zap, Clock } from 'lucide-react';

export const ChronoMatrixTapView: React.FC<GameInstanceProps> = ({
  onGameOver,
  isFrenzyMode = false,
  frenzyTimeLeft = 10,
  onScoreUpdate,
}) => {
  const [hudState, setHudState] = useState<ChronoMatrixState>(createInitialChronoMatrixState());
  const stateRef = useRef<ChronoMatrixState>(createInitialChronoMatrixState());
  const controllerRef = useRef<ChronoMatrixController>(new ChronoMatrixController());

  const handleCellClick = useCallback((cell: MatrixCell) => {
    controllerRef.current.tapCell(stateRef.current, cell);
    setHudState({ ...stateRef.current });
    if (onScoreUpdate) onScoreUpdate(stateRef.current.score);
  }, [onScoreUpdate]);

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      controllerRef.current.update(stateRef.current, delta);
      setHudState({ ...stateRef.current });

      if (stateRef.current.gameOver && !isFrenzyMode) {
        cancelAnimationFrame(animId);
        onGameOver({
          score: stateRef.current.score,
          marblesEarned: stateRef.current.marbles,
          won: false,
          stats: {
            'Rondas Completadas': stateRef.current.round - 1,
            'Canicas': stateRef.current.marbles,
          },
        });
      }
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [onGameOver, isFrenzyMode]);

  return (
    <div className="relative w-full h-full min-h-[460px] md:min-h-[580px] bg-slate-950 flex flex-col items-center justify-center p-4 select-none">
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-300 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Trophy className="w-4 h-4" />
            <span className="font-mono tabular-nums text-sm text-white">{hudState.score}</span>
          </div>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Zap className="w-4 h-4" />
            <span className="font-mono tabular-nums text-sm text-cyan-300">Ronda {hudState.round}</span>
          </div>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span>Canicas:</span>
            <span className="font-mono tabular-nums text-sm text-amber-300 font-bold">{hudState.marbles}</span>
          </div>
        </div>

        {/* Timer Bar */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-xl backdrop-blur-md">
          <Clock className="w-4 h-4 text-violet-400" />
          <span className="font-mono tabular-nums text-sm font-bold text-white">
            {isFrenzyMode ? `${Math.ceil(frenzyTimeLeft)}s` : `${hudState.roundTimeLeft.toFixed(1)}s`}
          </span>
        </div>
      </div>

      {/* Target Number Display */}
      <div className="mb-6 text-center">
        <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Busca el número</div>
        <div className="text-4xl md:text-5xl font-black font-mono text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
          {hudState.targetVal}
        </div>
      </div>

      {/* 3x3 Interactive Matrix Grid */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[320px] aspect-square">
        {hudState.cells.map((cell) => {
          const isTarget = cell.val === hudState.targetVal && !cell.cleared;
          return (
            <button
              key={cell.id}
              onClick={() => handleCellClick(cell)}
              disabled={cell.cleared}
              className={`relative flex items-center justify-center rounded-2xl font-mono text-2xl md:text-3xl font-bold transition-all duration-150 active:scale-95 shadow-md ${
                cell.cleared
                  ? 'bg-slate-900/40 text-slate-700 border border-slate-800/40 cursor-default'
                  : isTarget
                  ? 'bg-slate-900 text-cyan-300 border-2 border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.4)] hover:bg-slate-800'
                  : 'bg-slate-900/90 text-slate-200 border border-slate-700/60 hover:border-slate-500 hover:bg-slate-800'
              }`}
            >
              {cell.cleared ? '✓' : cell.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 text-xs text-slate-500 font-medium">
        Toca los números en orden ascendente (1 → 9) lo más rápido posible.
      </div>
    </div>
  );
};
