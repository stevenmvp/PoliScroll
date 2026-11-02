import React, { useEffect, useState, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { type GameDefinition, type GameResult } from '../types/game';
import { getAllGames } from '../games/registry';
import { soundManager } from '../services/soundManager';
import { progressionStore } from '../services/progressionStore';
import { arcadeConfigStore, METRONOME_TIERS, type MetronomeSpeedTier } from '../services/arcadeConfigStore';
import { Heart, Trophy, Zap, CircleDot, RotateCw, AlertTriangle, Play, Gauge } from 'lucide-react';

interface FrenzyModeProps {
  onExit: () => void;
  onOpenLeaderboard: () => void;
}

export const FrenzyMode: React.FC<FrenzyModeProps> = ({ onExit, onOpenLeaderboard }) => {
  const [frenzyDuration, setFrenzyDuration] = useState(() => arcadeConfigStore.getFrenzyDuration());
  const [currentTier, setCurrentTier] = useState<MetronomeSpeedTier>(() => arcadeConfigStore.getMetronomeTier());
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentGame, setCurrentGame] = useState<GameDefinition | null>(null);
  const [timeLeft, setTimeLeft] = useState(frenzyDuration);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [marblesEarned, setMarblesEarned] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [nextInstruction, setNextInstruction] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);

  const timerRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const marblesRef = useRef(0);

  // Pick random enabled game
  const pickNextGame = useCallback((currentId?: string): GameDefinition => {
    const all = getAllGames().filter((g) => g.id !== 'pachinko-drop' && arcadeConfigStore.isGameEnabled(g.id));
    const pool = all.length > 1 ? all.filter((g) => g.id !== currentId) : all;
    return pool[Math.floor(Math.random() * pool.length)] || all[0];
  }, []);

  const startNextRound = useCallback((currentId?: string) => {
    const next = pickNextGame(currentId);
    setIsRotating(true);
    setNextInstruction(next.instruction);
    soundManager.playClick('G4');

    // Calculate metronome acceleration tier based on streak if auto-accelerate is enabled
    let tier: MetronomeSpeedTier = arcadeConfigStore.getMetronomeTier();
    if (arcadeConfigStore.isAutoAccelerateEnabled()) {
      if (streak >= 7) tier = 'rapido';
      else if (streak >= 3) tier = 'medio';
      else tier = 'lento';
    }
    setCurrentTier(tier);

    setTimeout(() => {
      setCurrentGame(next);
      const dur = arcadeConfigStore.getFrenzyDuration();
      setFrenzyDuration(dur);
      setTimeLeft(dur);
      setIsRotating(false);

      // Accelerate tempo according to metronome tier
      const tierData = METRONOME_TIERS[tier];
      soundManager.setTempo(tierData.bpm);
      if (arcadeConfigStore.isMetronomeAudioEnabled()) {
        soundManager.playMetronomeTick(true);
      }
    }, 700);
  }, [streak, pickNextGame]);

  const startRun = async () => {
    await soundManager.initAudio();
    soundManager.startBGM(126);
    scoreRef.current = 0;
    marblesRef.current = 0;
    setScore(0);
    setStreak(0);
    setLives(3);
    setMarblesEarned(0);
    setIsGameOver(false);

    // Initial 3-2-1 countdown
    setCountdown(3);
    soundManager.playTimerTick(false);

    const countInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev > 1) {
          soundManager.playTimerTick(false);
          return prev - 1;
        } else {
          clearInterval(countInterval);
          soundManager.playTimerTick(true);
          setCountdown(null);
          setIsPlaying(true);
          startNextRound();
          return null;
        }
      });
    }, 700);
  };

  // Timer Loop (Configurable duration: 10s, 15s or custom)
  useEffect(() => {
    if (!isPlaying || isRotating || isGameOver) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.2) {
          // Time expired! Round survived!
          setStreak((s) => s + 1);
          const bonus = 250 + streak * 50;
          scoreRef.current += bonus;
          setScore(scoreRef.current);
          marblesRef.current += 2;
          setMarblesEarned(marblesRef.current);
          progressionStore.addMarbles(2);

          soundManager.playMarbleCollect(streak + 1);
          startNextRound(currentGame?.id);
          return arcadeConfigStore.getFrenzyDuration();
        }

        // Ticking audio alarm for last 3 seconds
        if (prev <= 3.2 && Math.floor(prev * 10) % 10 === 0) {
          soundManager.playTimerTick(true);
        }

        return prev - 0.1;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isRotating, isGameOver, startNextRound, currentGame, streak]);

  // Prevent browser window from scrolling while Frenzy is active
  useEffect(() => {
    if (!isPlaying) return;
    const preventScroll = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Spacebar'].includes(e.key)) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', preventScroll, { passive: false });
    return () => window.removeEventListener('keydown', preventScroll);
  }, [isPlaying]);

  const handleSubGameEnd = (result: GameResult) => {
    scoreRef.current += result.score;
    setScore(scoreRef.current);
    marblesRef.current += result.marblesEarned;
    setMarblesEarned(marblesRef.current);
    progressionStore.addMarbles(result.marblesEarned);

    if (!result.won) {
      setLives((l) => {
        const nextLives = l - 1;
        if (nextLives <= 0) {
          handleGameOver();
          return 0;
        }
        // Switch to next game immediately on loss of life
        startNextRound(currentGame?.id);
        return nextLives;
      });
    }
  };

  const handleGameOver = () => {
    setIsGameOver(true);
    setIsPlaying(false);
    soundManager.stopBGM();
    soundManager.playHit();

    // Record high score and submit to leaderboard
    progressionStore.recordFrenzyRun(scoreRef.current, streak);

    if (scoreRef.current > 1500) {
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    }
  };

  const handleExitRun = () => {
    soundManager.stopBGM();
    onExit();
  };

  const CurrentComponent = currentGame?.Component;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4">
      {/* Pre-Game Intro Screen */}
      {!isPlaying && !isGameOver && countdown === null && (
        <div className="max-w-2xl mx-auto text-center py-12 md:py-20">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-600 to-indigo-500 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.6)] mb-6">
            <Zap className="w-8 h-8 text-amber-300" />
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            MODO FRENESÍ {frenzyDuration} SEGUNDOS
          </h1>
          <p className="mt-4 text-slate-600 text-sm md:text-base leading-relaxed">
            Sobrevive al cambio constante. Cada <span className="text-indigo-600 font-bold font-mono">{frenzyDuration} segundos</span> la jugabilidad rota aleatoriamente a un micro-desafío distinto con aceleración metronómica en 3 niveles (Lento, Medio, Rápido).
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500" />
              <span>3 Vidas compartidas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Canicas triples en racha</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Metrónomo auto-acelerado</span>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={startRun}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-extrabold text-base md:text-lg shadow-xl shadow-violet-900/20 flex items-center gap-3 active:scale-95 transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>¡Comenzar Frenesí ({frenzyDuration}s)!</span>
            </button>
          </div>
        </div>
      )}

      {/* 3-2-1 Countdown Display */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
          <div className="text-center animate-in zoom-in-75 duration-300">
            <div className="text-8xl md:text-9xl font-black font-mono text-cyan-400 drop-shadow-[0_0_40px_rgba(6,182,212,0.8)]">
              {countdown}
            </div>
            <div className="text-xl md:text-2xl font-bold uppercase tracking-widest text-slate-300 mt-4">
              ¡Prepárate!
            </div>
          </div>
        </div>
      )}

      {/* Active Frenzy Game Canvas & HUD - Full Immersive Theater Mode */}
      {isPlaying && currentGame && CurrentComponent && (
        <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col justify-between overflow-hidden select-none">
          {/* Top Frenzy Header Bar */}
          <div className="w-full bg-white/95 border-b border-slate-200 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-xs backdrop-blur-md">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-5 h-5 transition-colors ${
                      i < lives ? 'text-red-500 fill-red-500 animate-pulse' : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-slate-300 hidden sm:inline" aria-hidden="true">·</span>

              {/* Metronome Speed Indicator */}
              <div
                className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-xl border shadow-2xs"
                style={{
                  backgroundColor: `${METRONOME_TIERS[currentTier].color}15`,
                  borderColor: `${METRONOME_TIERS[currentTier].color}40`,
                  color: METRONOME_TIERS[currentTier].color,
                }}
                title="Metrónomo de Velocidad activo"
              >
                <Gauge className="w-3.5 h-3.5" />
                <span className="font-mono">{METRONOME_TIERS[currentTier].label}</span>
              </div>

              <div className="hidden md:flex items-center gap-1.5 text-xs text-violet-700 font-semibold bg-violet-50 px-2.5 py-1 rounded-xl border border-violet-200">
                <RotateCw className="w-3.5 h-3.5 animate-spin text-violet-600" />
                <span>Rondas:</span>
                <span className="font-mono text-slate-900 text-sm font-bold">{streak}</span>
              </div>
            </div>

            {/* Score & Marbles */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1 text-amber-600">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="font-mono text-sm text-slate-900 tabular-nums">{score}</span>
              </div>
              <div className="flex items-center gap-1 text-cyan-600">
                <CircleDot className="w-4 h-4 text-amber-500" />
                <span className="font-mono text-sm text-amber-600 tabular-nums">+{marblesEarned}</span>
              </div>
            </div>

            {/* Quit button */}
            <button
              onClick={handleGameOver}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
            >
              Terminar
            </button>
          </div>

          {/* Countdown Meter Bar */}
          <div className="w-full h-2 bg-slate-200 relative overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ${
                timeLeft <= 3.0 ? 'bg-red-500 shadow-sm' : 'bg-gradient-to-r from-cyan-500 to-indigo-600'
              }`}
              style={{ width: `${(timeLeft / frenzyDuration) * 100}%` }}
            />
          </div>

          {/* Current Micro-Goal Banner */}
          <div className="bg-white/90 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs font-medium text-slate-700 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-cyan-600 uppercase tracking-wider">{currentGame.title}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-900 font-semibold">{currentGame.instruction}</span>
            </div>
            <div className="font-mono tabular-nums font-bold text-amber-600">
              {timeLeft.toFixed(1)}s
            </div>
          </div>

          {/* Rotating Transition Curtain */}
          {isRotating && (
            <div className="absolute inset-0 z-40 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-150">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 border border-violet-200 flex items-center justify-center mb-3 shadow-xs">
                <RotateCw className="w-6 h-6 text-violet-600 animate-spin" />
              </div>
              <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">¡Rotación Rápida!</div>
              <div className="text-xl md:text-2xl font-black text-slate-900">{nextInstruction}</div>
            </div>
          )}

          {/* Active Game Viewport - Responsive Full View */}
          <main className="flex-1 w-full max-w-6xl mx-auto p-2 sm:p-4 flex items-center justify-center overflow-hidden">
            <div className="w-full h-full max-h-[85vh] rounded-3xl overflow-hidden border border-slate-200 shadow-lg bg-white flex flex-col items-center justify-center relative">
              <CurrentComponent
                key={currentGame.id}
                onGameOver={handleSubGameEnd}
                isFrenzyMode={true}
                frenzyTimeLeft={timeLeft}
                onScoreUpdate={(s) => {
                  const surgeBoost = Math.min(5, 1 + streak * 0.5);
                  scoreRef.current += Math.floor(s * 0.05 * surgeBoost);
                  setScore(scoreRef.current);
                }}
              />
            </div>
          </main>

          {/* Bottom HUD bar with quick exit */}
          <footer className="w-full bg-white/90 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Juego: {currentGame.title}</span>
              <span className="hidden sm:inline text-slate-300">·</span>
              <span className="hidden sm:inline text-slate-500">{currentGame.instruction}</span>
            </div>
            <button
              onClick={handleExitRun}
              className="text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold border border-slate-200 transition-colors"
            >
              Salir del Frenesí (Esc)
            </button>
          </footer>
        </div>
      )}


      {/* Game Over Summary Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 mx-auto flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>

            <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Resultado del Frenesí</div>
            <h2 className="text-3xl font-extrabold text-white mt-1">¡Ronda Concluida!</h2>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-left">
                <div className="text-xs text-slate-400">Puntuación Total</div>
                <div className="text-2xl font-mono font-bold text-white mt-1">{score}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-left">
                <div className="text-xs text-slate-400">Racha de Juegos</div>
                <div className="text-2xl font-mono font-bold text-cyan-400 mt-1">{streak}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-left col-span-2">
                <div className="text-xs text-slate-400">Canicas Ganadas</div>
                <div className="text-2xl font-mono font-bold text-amber-400 mt-1 flex items-center gap-2">
                  <CircleDot className="w-5 h-5 fill-current" />
                  <span>+{marblesEarned}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={startRun}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Jugar de Nuevo</span>
              </button>

              <button
                onClick={() => {
                  setIsGameOver(false);
                  onOpenLeaderboard();
                }}
                className="w-full py-3 rounded-xl text-xs font-semibold text-cyan-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Ver en la Clasificación Mundial
              </button>

              <button
                onClick={handleExitRun}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Volver al Menú
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
