import React, { useState, useEffect, useRef } from 'react';
import { type GameDefinition, type GameResult } from '../types/game';
import { soundManager } from '../services/soundManager';
import { progressionStore } from '../services/progressionStore';
import { academicStore } from '../services/academicStore';
import { themeStore } from '../services/themeStore';
import {
  ArrowLeft,
  RotateCcw,
  Trophy,
  CircleDot,
  Zap,
  Flame,
  Sparkles,
  GraduationCap,
  BookOpen,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface ActiveGamePlayerProps {
  game: GameDefinition;
  onBack: () => void;
  onOpenAcademicDrawer: () => void;
  onGameResult?: (game: GameDefinition, result: GameResult) => void;
}

export const ActiveGamePlayer: React.FC<ActiveGamePlayerProps> = ({
  game,
  onBack,
  onOpenAcademicDrawer,
  onGameResult,
}) => {
  const [sessionKey, setSessionKey] = useState(1);
  const [currentScore, setCurrentScore] = useState(0);
  const [lastResult, setLastResult] = useState<GameResult | null>(null);
  const [activeTopic, setActiveTopic] = useState(() => academicStore.getActiveTopic());

  // Acelerómetro / Surge state
  const [accelerometerEnabled, setAccelerometerEnabled] = useState(true);
  const [surgeStreak, setSurgeStreak] = useState(0);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(themeStore.getSettings().isFullscreen);

  const prevScoreRef = useRef(0);

  useEffect(() => {
    const unsubAcademic = academicStore.subscribe(() => {
      setActiveTopic(academicStore.getActiveTopic());
    });
    const unsubTheme = themeStore.subscribe(() => {
      setIsFullscreen(themeStore.getSettings().isFullscreen);
    });
    return () => {
      unsubAcademic();
      unsubTheme();
    };
  }, []);

  // Prevent browser window from scrolling while playing & capture ESC to go back
  useEffect(() => {
    const preventScrollAndEsc = (e: KeyboardEvent) => {
      const interceptedKeys = [
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        ' ', 'Spacebar', 'w', 'W', 's', 'S', 'a', 'A', 'd', 'D', 'Enter'
      ];
      if (interceptedKeys.includes(e.key)) {
        // Prevent default browser scrolling without blocking games from receiving the event
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        onBack();
      }
    };
    window.addEventListener('keydown', preventScrollAndEsc, { passive: false });
    return () => window.removeEventListener('keydown', preventScrollAndEsc);
  }, [onBack]);

  const handleScoreUpdate = (rawScore: number) => {
    if (rawScore > prevScoreRef.current) {
      setSurgeStreak((prev) => {
        const next = prev + 1;
        if (accelerometerEnabled) {
          if (next >= 15) setSurgeMultiplier(3.0);
          else if (next >= 8) setSurgeMultiplier(2.0);
          else if (next >= 3) setSurgeMultiplier(1.5);
          else setSurgeMultiplier(1.2);
        }
        return next;
      });
      prevScoreRef.current = rawScore;
    }
    const multipliedScore = Math.floor(rawScore * (accelerometerEnabled ? surgeMultiplier : 1));
    setCurrentScore(multipliedScore);
  };

  const handleGameOver = (result: GameResult) => {
    const finalScore = Math.floor(result.score * (accelerometerEnabled ? surgeMultiplier : 1));
    const finalMarbles = Math.floor(result.marblesEarned * (accelerometerEnabled ? Math.max(1, Math.round(surgeMultiplier)) : 1));
    const boostedResult: GameResult = {
      ...result,
      score: finalScore,
      marblesEarned: finalMarbles,
      stats: {
        ...result.stats,
        'Tema Académico': activeTopic.shortCriteria,
        'Acelerómetro': accelerometerEnabled ? `${surgeMultiplier}x Activo` : 'Inactivo',
      },
    };

    setLastResult(boostedResult);
    onGameResult?.(game, boostedResult);
    progressionStore.recordGameScore(game.id, finalScore);
    progressionStore.addMarbles(finalMarbles);
    soundManager.playHit();
    setSurgeStreak(0);
    setSurgeMultiplier(1);
    prevScoreRef.current = 0;
  };

  const restartGame = () => {
    soundManager.playClick('C5');
    setLastResult(null);
    setCurrentScore(0);
    setSurgeStreak(0);
    setSurgeMultiplier(1);
    prevScoreRef.current = 0;
    setSessionKey((k) => k + 1);
  };

  const Component = game.Component;

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col justify-between overflow-hidden select-none">
      {/* Top Contemporary White HUD Bar */}
      <header className="w-full bg-white/95 border-b border-slate-200/90 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 shadow-xs backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => {
              soundManager.playClick('A3');
              onBack();
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors shrink-0 border border-slate-200"
            title="Volver al Catálogo (Esc)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Catálogo</span>
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 truncate leading-tight">
                {game.title}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 hidden md:inline">
                {game.dimension.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate hidden sm:block">
              {game.instruction}
            </p>
          </div>
        </div>

        {/* Center/Right Controls: Academic Notebook, Acelerómetro & Score */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Academic Topic & Feedback Trigger */}
          <button
            onClick={() => {
              soundManager.playClick('A4');
              onOpenAcademicDrawer();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-all shadow-xs"
            title="Abrir Cuaderno Académico y Feedback"
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Academia:</span>
            <span className="font-mono text-[11px] max-w-[100px] truncate text-indigo-900">
              {activeTopic.shortCriteria}
            </span>
          </button>

          {/* Acelerómetro Mechanic Toggle */}
          <button
            onClick={() => {
              setAccelerometerEnabled((prev) => !prev);
              soundManager.playClick('F4');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              accelerometerEnabled
                ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-xs'
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700'
            }`}
            title="Activa el Acelerómetro: Racha limpia acelera velocidad y multiplica puntos"
          >
            <Zap className={`w-3.5 h-3.5 ${accelerometerEnabled ? 'fill-amber-500 text-amber-600 animate-pulse' : ''}`} />
            <span className="hidden xs:inline">Acelerómetro</span>
            <span className="font-mono text-[11px] px-1 rounded bg-white border border-slate-200">
              {accelerometerEnabled ? `${surgeMultiplier}x` : 'OFF'}
            </span>
          </button>

          {/* Fullscreen Native Toggle */}
          <button
            onClick={async () => {
              soundManager.playClick('A4');
              await themeStore.toggleFullscreen();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isFullscreen
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
            title={isFullscreen ? 'Salir de Pantalla Completa' : 'Pantalla Completa Nativa'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{isFullscreen ? 'Salir' : 'Pantalla Completa'}</span>
          </button>

          {/* Current Score */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] font-semibold text-slate-500 hidden xs:inline">Pts:</span>
            <span className="font-mono text-sm sm:text-base font-black text-slate-900 tabular-nums">
              {currentScore}
            </span>
          </div>

          {/* Restart */}
          <button
            onClick={restartGame}
            className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
            title="Reiniciar (R)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reiniciar</span>
          </button>
        </div>
      </header>

      {/* Surge Heat Gauge (When Acelerómetro is active) */}
      {accelerometerEnabled && surgeStreak > 0 && (
        <div className="w-full bg-amber-50/90 border-b border-amber-200 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-amber-800 backdrop-blur-xs">
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
            <span className="font-bold">RACHA TURBO: {surgeStreak} racha limpia</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-700">Multiplicador:</span>
            <span className="text-amber-900 font-bold bg-white px-2 py-0.5 rounded border border-amber-300 shadow-2xs">
              {surgeMultiplier}x PUNTOS &amp; CANICAS
            </span>
          </div>
        </div>
      )}

      {/* Main Unified Arcade Stage Container (Consistent 16:10 Geometry across PC, Tablet and Mobile) */}
      <main className="flex-1 w-full max-w-none p-0 flex items-center justify-center overflow-hidden">
        <div
          className={`w-full max-w-5xl aspect-[16/10] max-h-[82vh] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-2xl bg-white flex flex-col items-center justify-center relative transition-all ${
            isFullscreen ? 'max-w-none max-h-none h-full aspect-auto rounded-none border-none' : ''
          }`}
        >
          <Component
            key={sessionKey}
            onGameOver={handleGameOver}
            isFrenzyMode={false}
            onScoreUpdate={handleScoreUpdate}
          />
        </div>
      </main>

      {/* Bottom Info Status */}
      <footer className="w-full bg-white/90 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700">Controles: {game.controlsDescription.desktop}</span>
          <span className="hidden sm:inline text-slate-300">·</span>
          <span className="hidden sm:inline text-slate-500">Pulsa <kbd className="bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded text-slate-700 font-mono text-[10px]">Esc</kbd> para salir</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-emerald-700">60 FPS Óptimo</span>
        </div>
      </footer>

      {/* Game Over Modal with Academic Feedback Gateway */}
      {lastResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center mb-3">
              <Trophy className="w-7 h-7" />
            </div>

            <div className="text-xs uppercase font-semibold text-slate-500 font-mono">Fin de la Partida</div>
            <h3 className="text-2xl font-black text-slate-900 mt-1">¡Ronda Concluida!</h3>

            <div className="mt-5 space-y-2.5">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Puntuación Final</span>
                <span className="font-mono font-bold text-slate-900 text-base tabular-nums">
                  {lastResult.score}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between text-xs">
                <span className="text-amber-800 font-medium">Canicas Ganadas</span>
                <span className="font-mono font-bold text-amber-700 text-base tabular-nums flex items-center gap-1">
                  <CircleDot className="w-4 h-4 fill-current text-amber-500" />
                  +{lastResult.marblesEarned}
                </span>
              </div>

              {lastResult.stats &&
                Object.entries(lastResult.stats).map(([k, v]) => (
                  <div
                    key={k}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-500 font-medium">{k}</span>
                    <span className="font-mono text-indigo-700 font-semibold">{v}</span>
                  </div>
                ))}
            </div>

            {/* Quick Link to Academic Notebook */}
            <button
              onClick={() => {
                soundManager.playClick('A4');
                onOpenAcademicDrawer();
              }}
              className="mt-4 w-full py-2.5 rounded-2xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 flex items-center justify-center gap-2 transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Ver Feedback &amp; Consultar al Tutor IA</span>
            </button>

            <div className="mt-3 flex flex-col gap-2">
              <button
                onClick={restartGame}
                className="w-full py-3 rounded-2xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md active:scale-98 transition-all"
              >
                Jugar de Nuevo
              </button>

              <button
                onClick={onBack}
                className="w-full py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Volver al Catálogo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
