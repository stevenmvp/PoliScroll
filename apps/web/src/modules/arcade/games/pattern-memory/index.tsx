import React, { useState, useEffect, useRef } from 'react';
import { type GameDefinition, type GameInstanceProps } from '../../types/game';
import { soundManager } from '../../services/soundManager';
import { Trophy, CircleDot, Play, Sparkles, Volume2 } from 'lucide-react';

const PADS = [
  { id: 0, label: 'Cian', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.7)', note: 'C4', activeBg: '#22d3ee' },
  { id: 1, label: 'Ámbar', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.7)', note: 'E4', activeBg: '#fbbf24' },
  { id: 2, label: 'Violeta', color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.7)', note: 'G4', activeBg: '#a78bfa' },
  { id: 3, label: 'Esmeralda', color: '#10b981', glow: 'rgba(16, 185, 129, 0.7)', note: 'B4', activeBg: '#34d399' },
];

export const PatternMemoryView: React.FC<GameInstanceProps> = ({
  onGameOver,
  onScoreUpdate,
}) => {
  const [sequence, setSequence] = useState<number[]>([0, 1]);
  const [playerStep, setPlayerStep] = useState(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [marbles, setMarbles] = useState(0);
  const [comboFlash, setComboFlash] = useState(false);

  const playSequence = (seq: number[]) => {
    setIsShowingSequence(true);
    setPlayerStep(0);

    seq.forEach((padId, index) => {
      setTimeout(() => {
        setActivePad(padId);
        soundManager.playClick(PADS[padId].note);
        setTimeout(() => setActivePad(null), 380);

        if (index === seq.length - 1) {
          setTimeout(() => setIsShowingSequence(false), 500);
        }
      }, (index + 1) * 620);
    });
  };

  useEffect(() => {
    const initialSeq = [Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)];
    setSequence(initialSeq);
    setTimeout(() => playSequence(initialSeq), 700);
  }, []);

  const handlePadClick = (id: number) => {
    if (isShowingSequence) return;

    setActivePad(id);
    soundManager.playClick(PADS[id].note);
    setTimeout(() => setActivePad(null), 220);

    if (id === sequence[playerStep]) {
      // Correct step
      const nextStep = playerStep + 1;
      setPlayerStep(nextStep);

      if (nextStep === sequence.length) {
        // Complete sequence!
        soundManager.playMarbleCollect(round);
        const gainedScore = 150 * round;
        const newScore = score + gainedScore;
        setScore(newScore);
        if (onScoreUpdate) onScoreUpdate(newScore);

        if (round % 2 === 0) setMarbles((m) => m + 1);

        setComboFlash(true);
        setTimeout(() => setComboFlash(false), 400);

        const newRound = round + 1;
        setRound(newRound);
        const nextSeq = [...sequence, Math.floor(Math.random() * 4)];
        setSequence(nextSeq);
        setTimeout(() => playSequence(nextSeq), 1000);
      }
    } else {
      // Mistake!
      soundManager.playHit();
      onGameOver({ score, marblesEarned: marbles, won: false });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[520px] flex flex-col items-center justify-center p-3 select-none">
      {/* Top HUD */}
      <div className="w-full max-w-[400px] mb-3 flex items-center justify-between text-xs font-semibold bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-1.5 text-amber-600">
          <Trophy className="w-4 h-4" />
          <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">{score}</span>
        </div>
        <div className="text-violet-600 font-bold bg-violet-50 px-2.5 py-1 rounded-xl border border-violet-200">
          Ronda {round} ({sequence.length} pasos)
        </div>
        <div className="text-cyan-600 font-mono font-bold flex items-center gap-1">
          <CircleDot className="w-4 h-4 text-amber-500" />
          <span className="tabular-nums">+{marbles}</span>
        </div>
      </div>

      {/* Main Glass Tactile Pad Container */}
      <div className="w-full max-w-[380px] bg-white border border-slate-200 p-6 rounded-3xl shadow-xl flex flex-col items-center relative overflow-hidden">
        {/* Status Prompt */}
        <div className="mb-5 flex items-center gap-2 text-xs font-bold font-mono tracking-wider text-slate-600">
          <Volume2 className="w-4 h-4 text-cyan-600" />
          <span>{isShowingSequence ? 'MEMORIZA EL RITMO...' : '¡TU TURNO! REPITE LA SECUENCIA'}</span>
        </div>

        {/* 2x2 Glowing Tactile Arcade Pads */}
        <div className="grid grid-cols-2 gap-4 w-full aspect-square max-w-[280px]">
          {PADS.map((pad) => {
            const isActive = activePad === pad.id;
            return (
              <button
                key={pad.id}
                onClick={() => handlePadClick(pad.id)}
                disabled={isShowingSequence}
                style={{
                  backgroundColor: isActive ? pad.activeBg : pad.color,
                  boxShadow: isActive ? `0 0 35px ${pad.glow}, 0 4px 12px rgba(0,0,0,0.2)` : '0 4px 10px rgba(0,0,0,0.1)',
                  transform: isActive ? 'scale(0.97)' : 'scale(1)',
                }}
                className={`rounded-3xl transition-all duration-150 active:scale-95 border-4 border-white flex flex-col items-center justify-center relative overflow-hidden cursor-pointer ${
                  isActive ? 'ring-4 ring-cyan-400' : ''
                }`}
              >
                {/* Pad Center Glowing Capsule */}
                <div className="w-8 h-8 rounded-2xl bg-white/40 flex items-center justify-center backdrop-blur-sm shadow-inner">
                  <div className={`w-3.5 h-3.5 rounded-full ${isActive ? 'bg-white scale-125' : 'bg-white/80'} transition-transform`} />
                </div>
                <span className="text-[11px] font-bold text-white/90 mt-2 font-mono tracking-wider uppercase">
                  {pad.label}
                </span>

                {/* Tactile Ripple Wave */}
                {isActive && (
                  <span className="absolute inset-0 rounded-3xl border-2 border-white animate-ping opacity-75 pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>

        {/* Progress Step Dots */}
        <div className="mt-5 flex items-center gap-2">
          {sequence.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i < playerStep
                  ? 'bg-emerald-500 scale-110'
                  : i === playerStep && !isShowingSequence
                  ? 'bg-cyan-500 animate-pulse'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const PatternMemoryGame: GameDefinition = {
  id: 'pattern-memory',
  title: 'Pattern Matrix Recall',
  dimension: '2d',
  category: 'logic',
  difficulty: 'medio',
  tagline: 'Memoriza la secuencia lumínica y sonora de paneles neón y repítela sin equivocarte.',
  instruction: '¡Observa la secuencia de colores y repítela pulsando los paneles en orden!',
  article: {
    lore: 'El sintetizador neuronal de la estación requiere sincronización de frecuencias para desbloquear los núcleos de memoria.',
    mechanics: 'Los cuadrantes se iluminan secuencialmente acompañados de tonos musicales. Repite la secuencia completa paso a paso.',
    tips: [
      'Asocia cada color con su tono musical característico para memorizar secuencias largas.',
      'Cada ronda exitosa añade un nuevo paso a la cadena.',
    ],
  },
  controlsDescription: {
    desktop: 'Clic sobre los cuadrantes de color',
    mobile: 'Toca los paneles de color en pantalla',
  },
  icon: 'Zap',
  color: '#EC4899',
  accentColor: '#06B6D4',
  unlockedByDefault: true,
  unlockCost: 0,
  Component: PatternMemoryView,
};
