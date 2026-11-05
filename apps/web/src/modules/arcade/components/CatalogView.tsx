import React, { useState, useEffect } from 'react';
import { type GameDefinition, type GameCategory } from '../types/game';
import { getAllGames } from '../games/registry';
import { progressionStore } from '../services/progressionStore';
import { soundManager } from '../services/soundManager';
import { academicStore } from '../services/academicStore';
import { arcadeConfigStore, METRONOME_TIERS, type MetronomeSpeedTier, type GameplayMode } from '../services/arcadeConfigStore';
import { GameDetailsModal } from './GameDetailsModal';
import { GamePreview } from './GamePreview';
import { Play, Info, Lock, Trophy, Sparkles, Gamepad2, GraduationCap, Zap, Flame, Sliders, Gauge, LayoutGrid, Rows3 } from 'lucide-react';

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
  const [catalogMode, setCatalogMode] = useState<'grid' | 'reels'>(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 700px)').matches ? 'reels' : 'grid'
  );

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

  const gameplayMode: GameplayMode = arcadeConfig.gameplayMode;
  const topic = academicStore.getActiveTopic();
  const chooseMode = (mode: GameplayMode) => {
    soundManager.playClick(mode === 'academia' ? 'A5' : 'E5');
    arcadeConfigStore.setGameplayMode(mode);
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

  const tier: MetronomeSpeedTier = arcadeConfig.metronomeTier || 'lento';
  const tierData = METRONOME_TIERS[tier] || METRONOME_TIERS.lento;
  const difficultyStyle: Record<string, { label: string; dots: number; tone: string }> = {
    facil: { label: 'Fácil', dots: 1, tone: 'bg-emerald-400' },
    medio: { label: 'Medio', dots: 2, tone: 'bg-amber-400' },
    experto: { label: 'Experto', dots: 3, tone: 'bg-rose-500' },
  };
  const categoryLabels: Record<string, string> = { '3d': 'Mundo 3D', rhythm: 'Ritmo', reflex: 'Reflejos', logic: 'Lógica' };
  const filters: Array<{ id: GameCategory; label: string }> = [
    { id: 'all', label: 'Todos' },
    { id: '3d', label: 'Mundos 3D' },
    { id: 'rhythm', label: 'Ritmo' },
    { id: 'reflex', label: 'Reflejos' },
    { id: 'logic', label: 'Lógica' },
  ];

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-5 md:py-6 select-none">
      {/* Elección principal: solo jugar o aprender jugando */}
      <section aria-labelledby="mode-title" className="mb-6">
        <h2 id="mode-title" className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">
          ¿Cómo quieres jugar hoy?
        </h2>
        <p className="mt-1 text-sm md:text-base text-slate-600">Elige el modo y entra directo a la acción. Puedes cambiarlo cuando quieras.</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4" role="radiogroup" aria-label="Modo de juego">
          <button
            type="button"
            role="radio"
            aria-checked={gameplayMode === 'arcade'}
            onClick={() => chooseMode('arcade')}
            className={`relative overflow-hidden text-left rounded-3xl p-5 md:p-6 border-2 transition-all ${gameplayMode === 'arcade' ? 'border-amber-400 bg-gradient-to-br from-amber-400 to-rose-500 text-white shadow-lg scale-[1.01]' : 'border-slate-200 bg-white text-slate-800 hover:border-amber-300'}`}
          >
            <Gamepad2 className="w-9 h-9 md:w-11 md:h-11" />
            <div className="mt-3 text-xl md:text-2xl font-black">Solo jugar</div>
            <p className={`mt-1 text-sm ${gameplayMode === 'arcade' ? 'text-white/90' : 'text-slate-500'}`}>Pura diversión: reflejos, ritmo y récords, sin preguntas.</p>
            {gameplayMode === 'arcade' && <span className="ps-pop-in absolute top-4 right-4 rounded-full bg-white/25 px-3 py-1 text-[11px] font-black uppercase tracking-wide">Activo</span>}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={gameplayMode === 'academia'}
            onClick={() => chooseMode('academia')}
            className={`relative overflow-hidden text-left rounded-3xl p-5 md:p-6 border-2 transition-all ${gameplayMode === 'academia' ? 'border-emerald-400 bg-gradient-to-br from-emerald-500 to-indigo-600 text-white shadow-lg scale-[1.01]' : 'border-slate-200 bg-white text-slate-800 hover:border-emerald-300'}`}
          >
            <GraduationCap className="w-9 h-9 md:w-11 md:h-11" />
            <div className="mt-3 text-xl md:text-2xl font-black">Aprender jugando</div>
            <p className={`mt-1 text-sm ${gameplayMode === 'academia' ? 'text-white/90' : 'text-slate-500'}`}>Cada juego se adapta a un tema académico y un tutor te ayuda a entenderlo.</p>
            {gameplayMode === 'academia' && <span className="ps-pop-in absolute top-4 right-4 rounded-full bg-white/25 px-3 py-1 text-[11px] font-black uppercase tracking-wide">Activo</span>}
          </button>
        </div>

        {gameplayMode === 'academia' && (
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 md:p-4">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-black uppercase tracking-wide text-emerald-700">Tema activo · {topic.domain}</div>
              <div className="truncate text-base font-extrabold text-slate-900">{topic.title}</div>
            </div>
            {onOpenAcademicDrawer && (
              <button
                type="button"
                onClick={() => { soundManager.playClick('A4'); onOpenAcademicDrawer(); }}
                className="w-full sm:w-auto rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Cambiar tema o ver feedback
              </button>
            )}
          </div>
        )}
      </section>

      {/* Rachas rápidas */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <span className="flex shrink-0 items-center gap-1.5 pr-1 text-sm font-black text-slate-900"><Flame className="w-4 h-4 text-orange-500" />Rachas</span>
        <button type="button" onClick={() => onStartWorkout?.(3)} className="shrink-0 flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100">
          <Zap className="w-3.5 h-3.5" />Sprint · 3 juegos
        </button>
        <button type="button" onClick={() => onStartWorkout?.(5)} className="shrink-0 flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100">
          <Trophy className="w-3.5 h-3.5" />Clásico · 5 juegos
        </button>
        <span className="shrink-0 flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold" style={{ backgroundColor: `${tierData.color}12`, borderColor: `${tierData.color}35`, color: tierData.color }} title="Velocidad del metrónomo">
          <Gauge className="w-3.5 h-3.5" />{tierData.label}
        </span>
        {onOpenSuperEditor && (
          <button type="button" onClick={() => { soundManager.playClick('C5'); onOpenSuperEditor(); }} className="shrink-0 flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200">
            <Sliders className="w-3.5 h-3.5" />Súper Módulo
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="mb-5 flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Categorías">
          {filters.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selectedCategory === tab.id}
              onClick={() => handleCategoryChange(tab.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs md:text-sm font-bold transition-all ${selectedCategory === tab.id ? 'bg-slate-900 text-white shadow' : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCatalogMode((mode) => (mode === 'grid' ? 'reels' : 'grid'))}
          className="shrink-0 flex items-center gap-1.5 rounded-full border border-violet-200 bg-white px-3 py-2 text-xs font-bold text-violet-700"
          aria-pressed={catalogMode === 'reels'}
          title={catalogMode === 'reels' ? 'Ver en cuadrícula' : 'Ver en formato reels'}
        >
          {catalogMode === 'reels' ? <LayoutGrid className="w-4 h-4" /> : <Rows3 className="w-4 h-4" />}
          <span className="hidden sm:inline">{catalogMode === 'reels' ? 'Cuadrícula' : 'Reels'}</span>
        </button>
      </div>

      {/* Tarjetas de juego */}
      <div className={catalogMode === 'reels'
        ? 'arcade-reels flex flex-col gap-5 overflow-y-auto snap-y snap-mandatory pr-1'
        : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6'}>
        {filteredGames.map((game, gameIndex) => {
          const isUnlocked = progression.unlockedGames.includes(game.id);
          const highScore = progression.gameHighScores[game.id] || 0;
          const difficulty = difficultyStyle[game.difficulty] ?? difficultyStyle.medio;

          return (
            <article
              key={`${selectedCategory}-${game.id}`}
              style={{ animationDelay: `${Math.min(gameIndex, 8) * 55}ms` }}
              className={`ps-card-rise group relative flex min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${catalogMode === 'reels' ? 'snap-start' : ''}`}
            >
              <button
                type="button"
                onClick={() => (isUnlocked ? (soundManager.playClick('C5'), onPlayGame(game)) : handleUnlock(game))}
                className="relative block w-full text-left"
                aria-label={isUnlocked ? `Jugar ${game.title}` : `Desbloquear ${game.title}`}
              >
                <GamePreview game={game} locked={!isUnlocked} className={catalogMode === 'reels' ? 'aspect-[16/10] md:aspect-[16/8]' : 'aspect-video'} />
                <div className="absolute left-3 top-3 flex items-center gap-1.5">
                  <span className="rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white backdrop-blur">{game.dimension}</span>
                  <span className="rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">{categoryLabels[game.dimension === '3d' ? '3d' : game.category] ?? game.category}</span>
                </div>
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur" title={`Dificultad: ${difficulty.label}`}>
                  {[1, 2, 3].map((dot) => <span key={dot} className={`h-1.5 w-1.5 rounded-full ${dot <= difficulty.dots ? difficulty.tone : 'bg-white/30'}`} />)}
                  <span className="ml-1">{difficulty.label}</span>
                </div>
                <div className="absolute inset-0 grid place-items-center">
                  {isUnlocked ? (
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-slate-900 opacity-90 shadow-lg transition-transform group-hover:scale-110 md:opacity-0 md:group-hover:opacity-100"><Play className="ml-0.5 h-6 w-6 fill-current" /></span>
                  ) : (
                    <span className="flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-xs font-black text-amber-950 shadow-lg"><Lock className="h-4 w-4" />{game.unlockCost} canicas</span>
                  )}
                </div>
              </button>

              <div className="flex flex-1 flex-col p-4 md:p-5">
                <h3 className="text-lg font-black tracking-tight text-slate-900 md:text-xl">{game.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">{game.tagline}</p>
                {gameplayMode === 'academia' && (
                  <p className="mt-2 inline-flex w-fit max-w-full items-center gap-1.5 truncate rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                    <GraduationCap className="h-3 w-3 shrink-0" /><span className="truncate">Aprendes: {topic.title}</span>
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <div className="min-w-0 text-xs font-semibold text-slate-500">
                    {highScore > 0 ? (
                      <span className="flex items-center gap-1 text-amber-600"><Trophy className="h-3.5 w-3.5" />Récord <b className="font-mono tabular-nums text-slate-900">{highScore}</b></span>
                    ) : (
                      <span className="truncate">{game.controlsDescription.mobile}</span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { soundManager.playClick('A4'); setInspectedGame(game); }}
                      className="grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      aria-label={`Detalles de ${game.title}`}
                      title="Detalles"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                    {isUnlocked ? (
                      <button type="button" onClick={() => { soundManager.playClick('C5'); onPlayGame(game); }} className="flex items-center gap-1.5 rounded-full bg-violet-600 px-5 py-2 text-xs font-black text-white shadow-xs transition-all hover:bg-violet-700 active:scale-95">
                        <Play className="h-3.5 w-3.5 fill-current" />Jugar
                      </button>
                    ) : (
                      <button type="button" onClick={() => handleUnlock(game)} className="flex items-center gap-1.5 rounded-full bg-amber-400 px-4 py-2 text-xs font-black text-amber-950 hover:bg-amber-300">
                        <Lock className="h-3.5 w-3.5" />Desbloquear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

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
