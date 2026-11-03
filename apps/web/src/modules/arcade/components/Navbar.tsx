import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Sparkles, CircleDot, GraduationCap, Palette, Sliders, Gamepad2, Zap } from 'lucide-react';
import { soundManager } from '../services/soundManager';
import { progressionStore } from '../services/progressionStore';
import { academicStore } from '../services/academicStore';
import { themeStore } from '../services/themeStore';
import { arcadeConfigStore, type GameplayMode } from '../services/arcadeConfigStore';

export type ActiveTab = 'catalog' | 'frenzy' | 'pachinko' | 'leaderboard';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAcademicDrawer: () => void;
  onOpenCustomizer: () => void;
  onOpenSuperEditor: () => void;
  onStartWorkout: (count: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenAcademicDrawer,
  onOpenCustomizer,
  onOpenSuperEditor,
  onStartWorkout,
}) => {
  const [marbles, setMarbles] = useState(progressionStore.getMarbles());
  const [isMuted, setIsMuted] = useState(soundManager.isMuted());
  const [academicLogsCount, setAcademicLogsCount] = useState(academicStore.getLogs().length);
  const [activeTopic, setActiveTopic] = useState(academicStore.getActiveTopic());
  const [gameplayMode, setGameplayMode] = useState<GameplayMode>(arcadeConfigStore.getGameplayMode());

  useEffect(() => {
    const unsub1 = progressionStore.subscribe(() => {
      setMarbles(progressionStore.getMarbles());
    });
    const unsub2 = academicStore.subscribe(() => {
      setAcademicLogsCount(academicStore.getLogs().length);
      setActiveTopic(academicStore.getActiveTopic());
    });
    const unsub3 = arcadeConfigStore.subscribe(() => {
      setGameplayMode(arcadeConfigStore.getGameplayMode());
    });
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  const handleModeToggle = () => {
    soundManager.playClick('A5');
    const next = arcadeConfigStore.toggleGameplayMode();
    setGameplayMode(next);
  };

  const handleAudioToggle = async () => {
    await soundManager.initAudio();
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) soundManager.playClick('C5');
  };

  const handleTabClick = async (tab: ActiveTab) => {
    await soundManager.initAudio();
    soundManager.playClick('E4');
    onTabChange(tab);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 md:px-8 py-3.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => handleTabClick('catalog')}
          className="flex items-center gap-2.5 text-left group shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg md:text-xl font-black tracking-tight text-slate-900 whitespace-nowrap">
            VORTEX<span className="text-indigo-600">.</span>ARCADE
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold">
          <button
            onClick={() => handleTabClick('catalog')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'catalog'
                ? 'text-indigo-700 border-b-2 border-indigo-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Catálogo Libre
          </button>
          <button
            onClick={() => handleTabClick('frenzy')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'frenzy'
                ? 'text-indigo-700 border-b-2 border-indigo-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Modo Frenesí 10s
          </button>
          <button
            onClick={() => handleTabClick('pachinko')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'pachinko'
                ? 'text-indigo-700 border-b-2 border-indigo-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gachapón &amp; Canicas
          </button>
          <button
            onClick={() => handleTabClick('leaderboard')}
            className={`whitespace-nowrap transition-colors py-1 ${
              activeTab === 'leaderboard'
                ? 'text-indigo-700 border-b-2 border-indigo-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Clasificación Global
          </button>
        </nav>

        {/* Zone 3: Master Mode, Súper Módulo, Academic Notebook & Wallet */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Master Mode Switch: Academia vs Solo Juegos */}
          <button
            onClick={handleModeToggle}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${
              gameplayMode === 'academia'
                ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
            }`}
            title={
              gameplayMode === 'academia'
                ? 'Modo: Academia Activa (Raciocinio, conceptos y cuaderno). Clic para Solo Juegos.'
                : 'Modo: Solo Juegos (Pura acción y reflejos, sin preguntas). Clic para Academia.'
            }
          >
            {gameplayMode === 'academia' ? (
              <>
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden md:inline font-normal text-emerald-700">Modo:</span>
                <span className="font-extrabold text-emerald-800">Modo Aprendizaje</span>
              </>
            ) : (
              <>
                <Gamepad2 className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline font-normal text-amber-700">Modo:</span>
                <span className="font-extrabold text-amber-800">Solo Juegos</span>
              </>
            )}
          </button>

          {/* Súper Módulo Editor Trigger */}
          <button
            onClick={() => {
              soundManager.playClick('B4');
              onOpenSuperEditor();
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100/90 border border-purple-200 text-purple-700 font-bold text-xs shadow-xs transition-all group"
            title="Abrir Súper Módulo: Modos, Entrenamientos 3/5, Metrónomo de Velocidad y Editor de Juegos"
          >
            <Sliders className="w-4 h-4 text-purple-600 group-hover:rotate-45 transition-transform" />
            <span className="hidden xl:inline">Súper Módulo</span>
          </button>

          {/* Academic Topic & Feedback Notebook Trigger (if in academia mode) */}
          {gameplayMode === 'academia' && (
            <button
              onClick={() => {
                soundManager.playClick('A4');
                onOpenAcademicDrawer();
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100/90 border border-indigo-200 text-indigo-700 font-bold text-xs shadow-xs transition-all relative group"
              title="Abrir Cuaderno Académico: Historial de respuestas, desglose de errores y Tutor IA"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span className="max-w-[100px] truncate hidden lg:inline text-indigo-900">
                {activeTopic.title.split(':')[0]}
              </span>
              {academicLogsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-mono font-bold">
                  {academicLogsCount}
                </span>
              )}
            </button>
          )}

          {/* Marble Wallet Display */}
          <button
            onClick={() => handleTabClick('pachinko')}
            className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/90 px-3.5 py-1.5 rounded-xl shadow-xs transition-all group"
            title="Ir al Salón de Gachapón para usar tus canicas"
          >
            <CircleDot className="w-4 h-4 text-amber-500 group-hover:rotate-45 transition-transform" />
            <span className="font-mono tabular-nums text-sm font-black text-amber-900">
              {marbles}
            </span>
            <span className="hidden sm:inline text-xs text-amber-800 font-bold">Canicas</span>
          </button>

          {/* Theme & Biome Customizer Trigger */}
          <button
            onClick={() => {
              soundManager.playClick('C5');
              onOpenCustomizer();
            }}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-colors"
            title="Personalizar Biomas, Canicas y Pantalla Completa"
          >
            <Palette className="w-4 h-4 text-indigo-600" />
          </button>

          {/* Audio Toggle */}
          <button
            onClick={handleAudioToggle}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center justify-center transition-colors"
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around pt-2.5 mt-2.5 border-t border-slate-200 text-xs font-semibold">
        <button
          onClick={() => handleTabClick('catalog')}
          className={`py-1 ${activeTab === 'catalog' ? 'text-indigo-700 font-bold' : 'text-slate-500'}`}
        >
          Catálogo
        </button>
        <button
          onClick={() => handleTabClick('frenzy')}
          className={`py-1 ${activeTab === 'frenzy' ? 'text-indigo-700 font-bold' : 'text-slate-500'}`}
        >
          Frenesí 10s
        </button>
        <button
          onClick={() => handleTabClick('pachinko')}
          className={`py-1 ${activeTab === 'pachinko' ? 'text-amber-700 font-bold' : 'text-slate-500'}`}
        >
          Gachapón
        </button>
        <button
          onClick={() => handleTabClick('leaderboard')}
          className={`py-1 ${activeTab === 'leaderboard' ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}
        >
          Ranking
        </button>
      </div>
    </header>
  );
};
