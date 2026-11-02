import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { type GameDefinition, type GameResult } from '../types/game';
import { getAllGames } from '../games/registry';
import { arcadeConfigStore, METRONOME_TIERS } from '../services/arcadeConfigStore';
import { soundManager } from '../services/soundManager';
import { progressionStore } from '../services/progressionStore';
import {
  Trophy,
  Zap,
  ArrowRight,
  Flame,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Play,
  X,
  GraduationCap,
  Gamepad2,
} from 'lucide-react';

interface WorkoutRunnerProps {
  totalGames: number;
  onExit: () => void;
  onOpenLeaderboard: () => void;
}

export const WorkoutRunner: React.FC<WorkoutRunnerProps> = ({
  totalGames,
  onExit,
  onOpenLeaderboard,
}) => {
  const [config, setConfig] = useState(() => arcadeConfigStore.getConfig());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [totalMarbles, setTotalMarbles] = useState(0);
  const [isWorkoutCompleted, setIsWorkoutCompleted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Filter enabled games
  const playlist = useRef<GameDefinition[]>([]);

  useEffect(() => {
    return arcadeConfigStore.subscribe(() => {
      setConfig(arcadeConfigStore.getConfig());
    });
  }, []);

  // Build random playlist of enabled games
  useEffect(() => {
    const enabled = getAllGames().filter(
      (g) => g.id !== 'pachinko-drop' && arcadeConfigStore.isGameEnabled(g.id)
    );
    const shuffled = [...enabled].sort(() => Math.random() - 0.5);
    playlist.current = shuffled.slice(0, Math.min(totalGames, shuffled.length));
    if (playlist.current.length === 0 && enabled.length > 0) {
      playlist.current = enabled.slice(0, totalGames);
    }
  }, [totalGames]);

  // Audio Metronome tick loop
  useEffect(() => {
    if (isWorkoutCompleted || isTransitioning) return;

    const info = METRONOME_TIERS[config.metronomeTier];
    const intervalMs = (60 / info.bpm) * 1000;

    let beatCount = 0;
    const interval = setInterval(() => {
      if (config.metronomeAudioEnabled) {
        soundManager.playMetronomeTick(beatCount % 4 === 0);
      }
      beatCount++;
    }, intervalMs);

    return () => clearInterval(interval);
  }, [config.metronomeTier, config.metronomeAudioEnabled, isWorkoutCompleted, isTransitioning]);

  const handleGameEnd = (result: GameResult) => {
    const newScore = totalScore + result.score;
    const newMarbles = totalMarbles + result.marblesEarned;
    setTotalScore(newScore);
    setTotalMarbles(newMarbles);
    progressionStore.addMarbles(result.marblesEarned);

    // Auto-advance metronome speed tier as training progresses
    if (config.autoAccelerateMetronome) {
      if (currentIndex === 0) arcadeConfigStore.setMetronomeTier('medio');
      else if (currentIndex >= 2) arcadeConfigStore.setMetronomeTier('rapido');
    }

    if (currentIndex + 1 >= playlist.current.length) {
      // Completed all games in workout!
      soundManager.playFanfare();
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
      setIsWorkoutCompleted(true);
    } else {
      // Transition to next game in playlist
      setIsTransitioning(true);
      soundManager.playCorrect();
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setIsTransitioning(false);
      }, 1000);
    }
  };

  const currentGame = playlist.current[currentIndex];

  if (!currentGame && !isWorkoutCompleted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-500 font-bold">Cargando circuito de entrenamiento...</div>
      </div>
    );
  }

  // Final Summary Screen
  if (isWorkoutCompleted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ¡Entrenamiento Completado!
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              Resumen del Circuito ({playlist.current.length} Juegos)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {config.gameplayMode === 'academia' ? 'Modo Academia Socrática' : 'Modo Solo Juegos (Arcade Puro)'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Puntaje Total</div>
              <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
                {totalScore.toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
              <div className="text-[10px] font-bold text-amber-700 uppercase">Canicas Ganadas</div>
              <div className="text-xl font-black text-amber-900 font-mono mt-0.5">
                +{totalMarbles}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-900">Velocidad Metrónomo Alcanzada:</span>
            <span className="font-mono font-black text-indigo-700 uppercase">
              {METRONOME_TIERS[config.metronomeTier].label}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                soundManager.playClick('A4');
                setCurrentIndex(0);
                setTotalScore(0);
                setTotalMarbles(0);
                setIsWorkoutCompleted(false);
                arcadeConfigStore.setMetronomeTier('lento');
              }}
              className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Repetir Circuito</span>
            </button>

            <button
              onClick={onExit}
              className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              Volver al Catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const Component = currentGame.Component;
  const currentTierInfo = METRONOME_TIERS[config.metronomeTier];

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col justify-between overflow-hidden select-none">
      {/* Top Contemporary White HUD Bar */}
      <header className="w-full bg-white/95 border-b border-slate-200/90 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-xs backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 uppercase">
                Juego {currentIndex + 1} de {playlist.current.length}
              </span>
              <span className="text-sm font-extrabold text-slate-900 hidden sm:inline">
                {currentGame.title}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Metronome Speed & Audio Pulse Indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            onClick={() => arcadeConfigStore.advanceMetronomeTier()}
            style={{ borderColor: currentTierInfo.color }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border shadow-2xs cursor-pointer hover:bg-slate-50 transition-all"
            title="Haz clic para acelerar o cambiar el metrónomo de velocidad"
          >
            <div
              style={{ backgroundColor: currentTierInfo.color }}
              className="w-2.5 h-2.5 rounded-full animate-ping"
            />
            <span className="text-xs font-black" style={{ color: currentTierInfo.color }}>
              {currentTierInfo.label}
            </span>
          </div>

          {/* Mode Pill */}
          <div className="hidden md:flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold">
            {config.gameplayMode === 'academia' ? (
              <>
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Academia</span>
              </>
            ) : (
              <>
                <Gamepad2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Arcade Puro</span>
              </>
            )}
          </div>
        </div>

        {/* Accumulated Score */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center gap-1.5 font-mono text-xs font-black">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>{totalScore.toLocaleString()}</span>
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-2 sm:p-4 flex items-center justify-center overflow-hidden">
        {isTransitioning ? (
          <div className="text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900">¡Ronda Superada!</h3>
            <p className="text-xs text-slate-500">Preparando el siguiente desafío...</p>
          </div>
        ) : (
          <Component
            key={`${currentGame.id}-${currentIndex}`}
            onGameOver={handleGameEnd}
            isFrenzyMode={false}
          />
        )}
      </main>
    </div>
  );
};
