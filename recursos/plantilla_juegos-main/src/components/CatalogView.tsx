import React, { useState, useEffect } from 'react';
import { type GameDefinition, type GameCategory } from '../types/game';
import { getAllGames } from '../games/registry';
import { progressionStore } from '../services/progressionStore';
import { soundManager } from '../services/soundManager';
import { academicStore } from '../services/academicStore';
import { arcadeConfigStore, METRONOME_TIERS, type MetronomeSpeedTier } from '../services/arcadeConfigStore';
import { GameDetailsModal } from './GameDetailsModal';
import { Play, Info, Lock, Trophy, Sparkles, Gamepad2, GraduationCap, Zap, Flame, Sliders, Gauge } from 'lucide-react';

interface CatalogViewProps {
  onPlayGame: (game: GameDefinition) => void;
  onOpenGachapon: () => void;
  onOpenAcademicDrawer?: () => void;
  onStartWorkout?: (count: number) => void;
  onOpenSuperEditor?: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  onPlayGame,
  onOpenGachapon,
  onOpenAcademicDrawer,
  onStartWorkout,
  onOpenSuperEditor,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');
  const [inspectedGame, setInspectedGame] = useState<GameDefinition | null>(null);
  const [progression, setProgression] = useState(progressionStore.getData());
  const [arcadeConfig, setArcadeConfig] = useState(() => arcadeConfigStore.getConfig());

  React.useEffect(() => {
    const unsub1 = progressionStore.subscribe(() => {
      setProgression(progressionStore.getData());
    });
    const unsub2 = arcadeConfigStore.subscribe(() => {
      setArcadeConfig(arcadeConfigStore.getConfig());
    });
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const allGames = getAllGames().filter((g) => g.id !== 'pachinko-drop');
  const filteredGames =
    selectedCategory === 'all'
      ? allGames
      : allGames.filter((g) => g.category === selectedCategory);

  const handleCategoryChange = (cat: GameCategory) => {
    soundManager.playClick('D4');
    setSelectedCategory(cat);
  };

  const handleUnlock = (game: GameDefinition) => {
    if (progressionStore.spendMarbles(game.unlockCost)) {
      progressionStore.unlockGame(game.id);
      soundManager.playFanfare();
    } else {
      soundManager.playHit();
      onOpenGachapon();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 select-none">
      {/* Clean Contemporary White Hero Banner */}
      <div className="mb-8 p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>MOTOR DE JUEGOS CON RACIOCINIO ACADÉMICO</span>
            <span aria-hidden="true">·</span>
            <span>GEMINI IA GROUNDED</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Aprende jugando con raciocinio en tiempo real
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-600 leading-relaxed font-normal">
            Cada minijuego adapta sus mecánicas y obstáculos al tema académico activo (mitología, anatomía del húmero, álgebra, biología o el tema que generes con IA). ¡Pisa conceptos correctos, evita distractores y dialoga con el tutor socrático!
          </p>
        </div>

        {/* Quick Academic Topic Card & Drawer Launcher */}
        <div className="shrink-0 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-200/90 shadow-xs max-w-sm w-full">
          <div className="flex items-center justify-between text-xs text-indigo-700 font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tema Activo</span>
            </span>
            <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-mono text-[10px]">
              {academicStore.getActiveTopic().domain.toUpperCase()}
            </span>
          </div>
          <div className="text-base font-extrabold text-slate-900 truncate">
            {academicStore.getActiveTopic().title}
          </div>
          <div className="text-xs text-slate-500 mt-1 line-clamp-2">
            {academicStore.getActiveTopic().promptQuestion}
          </div>
          {onOpenAcademicDrawer && (
            <button
              onClick={() => {
                soundManager.playClick('A4');
                onOpenAcademicDrawer();
              }}
              className="mt-3 w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Cambiar Tema / Ver Feedback IA</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Workouts & Metronome Velocity Scaler Strip */}
      <div className="mb-8 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shrink-0 shadow-xs">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900 tracking-tight">Entrenamientos Rápidos</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                PLAYLISTS
              </span>
            </div>
            <div className="text-xs text-slate-500">
              Rachas guiadas de juegos consecutivos con métricas y metrónomo adaptativo.
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* 3 Games Sprint */}
          <button
            onClick={() => onStartWorkout?.(3)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-all shadow-xs"
            title="Iniciar racha rápida de 3 minijuegos seguidos"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Sprint (3 Juegos)</span>
          </button>

          {/* 5 Games Classic */}
          <button
            onClick={() => onStartWorkout?.(5)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 text-xs font-bold transition-all shadow-xs"
            title="Iniciar racha clásica de 5 minijuegos seguidos"
          >
            <Trophy className="w-3.5 h-3.5 text-violet-600" />
            <span>Clásico (5 Juegos)</span>
          </button>

          {/* Metronome Speed Status */}
          {(() => {
            const tier: MetronomeSpeedTier = arcadeConfig.metronomeTier || 'lento';
            const tierData = METRONOME_TIERS[tier] || METRONOME_TIERS.lento;
            return (
              <div
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold"
                style={{
                  backgroundColor: `${tierData.color}12`,
                  borderColor: `${tierData.color}35`,
                  color: tierData.color,
                }}
                title="Velocidad del metrónomo global para juegos y entrenamientos"
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>{tierData.label}</span>
              </div>
            );
          })()}

          {/* Open Super Module */}
          {onOpenSuperEditor && (
            <button
              onClick={() => {
                soundManager.playClick('C5');
                onOpenSuperEditor();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-colors"
              title="Abrir Súper Módulo para configurar entrenamientos, metrónomo y juegos"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-600" />
              <span>Súper Módulo</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Tabs (Interactive Filter Controls, functional buttons) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 border border-slate-200 rounded-2xl mb-8 overflow-x-auto">
        {[
          { id: 'all', label: 'Todos los Juegos' },
          { id: '3d', label: 'Mundos 3D' },
          { id: 'rhythm', label: 'Ritmo & Beat' },
          { id: 'reflex', label: 'Reflejos & Acción' },
          { id: 'logic', label: 'Lógica & Memoria' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleCategoryChange(tab.id as GameCategory)}
            className={`px-4 py-2 text-xs md:text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === tab.id
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Games Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game) => {
          const isUnlocked = progression.unlockedGames.includes(game.id);
          const highScore = progression.gameHighScores[game.id] || 0;

          return (
            <div
              key={game.id}
              className="group relative bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-xs hover:shadow-md"
            >
              <div>
                {/* Quiet Unboxed Metadata (Zero-Pill rule) */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium">
                  <span className="font-mono text-violet-600 uppercase font-bold">
                    {game.dimension.toUpperCase()}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{game.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{game.difficulty}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-violet-600 transition-colors">
                  {game.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-xs md:text-sm text-slate-600 leading-relaxed line-clamp-2">
                  {game.tagline}
                </p>

                {/* High score info */}
                {highScore > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Récord personal:</span>
                    <span className="font-mono font-bold tabular-nums text-slate-900">{highScore}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    soundManager.playClick('A4');
                    setInspectedGame(game);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  <Info className="w-4 h-4" />
                  <span>Detalles &amp; Modelos</span>
                </button>

                {isUnlocked ? (
                  <button
                    onClick={() => {
                      soundManager.playClick('C5');
                      onPlayGame(game);
                    }}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Jugar</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnlock(game)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Desbloquear ({game.unlockCost})</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Model & Architecture Details Modal */}
      {inspectedGame && (
        <GameDetailsModal
          game={inspectedGame}
          isOpen={!!inspectedGame}
          onClose={() => setInspectedGame(null)}
          onPlay={() => onPlayGame(inspectedGame)}
          isUnlocked={progression.unlockedGames.includes(inspectedGame.id)}
          onUnlock={() => handleUnlock(inspectedGame)}
        />
      )}
    </div>
  );
};
