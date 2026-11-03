import React, { useState } from 'react';
import { Navbar, type ActiveTab } from './components/Navbar';
import { CatalogView } from './components/CatalogView';
import { FrenzyMode } from './components/FrenzyMode';
import { PachinkoSalon } from './components/PachinkoSalon';
import { LeaderboardView } from './components/LeaderboardView';
import { ActiveGamePlayer } from './components/ActiveGamePlayer';
import { AcademicFeedbackDrawer } from './components/AcademicFeedbackDrawer';
import { ThemeCustomizerModal } from './components/ThemeCustomizerModal';
import { SuperGameEditorModal } from './components/SuperGameEditorModal';
import { WorkoutRunner } from './components/WorkoutRunner';
import { type GameDefinition } from './types/game';
import type { GameResult } from './types/game';
import { themeStore } from './services/themeStore';

interface ArcadeModuleProps {
  onGameResult?: (game: GameDefinition, result: GameResult) => void;
}

export default function App({ onGameResult }: ArcadeModuleProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('catalog');
  const [activePlayingGame, setActivePlayingGame] = useState<GameDefinition | null>(null);
  const [activeWorkoutCount, setActiveWorkoutCount] = useState<number | null>(null);
  const [isAcademicDrawerOpen, setIsAcademicDrawerOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isSuperEditorOpen, setIsSuperEditorOpen] = useState(false);

  const handlePlayGame = (game: GameDefinition) => {
    setActiveWorkoutCount(null);
    void themeStore.toggleFullscreen();
    setActivePlayingGame(game);
  };

  const handleStartWorkout = (count: number) => {
    setActivePlayingGame(null);
    void themeStore.toggleFullscreen();
    setActiveWorkoutCount(count);
  };

  const handleBackToCatalog = () => {
    if (document.fullscreenElement) {
      void themeStore.toggleFullscreen();
    }
    setActivePlayingGame(null);
    setActiveWorkoutCount(null);
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActivePlayingGame(null);
    setActiveWorkoutCount(null);
    setActiveTab(tab);
  };

  return (
    <div className="min-h-0 w-full overflow-x-hidden bg-[#f8fafc] text-slate-900 flex flex-col justify-between selection:bg-indigo-500/20 selection:text-indigo-900">
      <div>
        {/* Universal Top Bar */}
        <Navbar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenAcademicDrawer={() => setIsAcademicDrawerOpen(true)}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
          onOpenSuperEditor={() => setIsSuperEditorOpen(true)}
          onStartWorkout={handleStartWorkout}
        />

        {/* Main View Router */}
        <main className="min-h-0 pb-8">
          {activeWorkoutCount !== null ? (
            <WorkoutRunner
              totalGames={activeWorkoutCount}
              onExit={handleBackToCatalog}
              onGameResult={onGameResult}
              onOpenLeaderboard={() => {
                setActiveWorkoutCount(null);
                setActiveTab('leaderboard');
              }}
            />
          ) : activePlayingGame ? (
            <ActiveGamePlayer
              game={activePlayingGame}
              onBack={handleBackToCatalog}
              onOpenAcademicDrawer={() => setIsAcademicDrawerOpen(true)}
              onGameResult={onGameResult}
            />
          ) : (
            <>
              {activeTab === 'catalog' && (
                <CatalogView
                  onPlayGame={handlePlayGame}
                  onOpenGachapon={() => setActiveTab('pachinko')}
                  onOpenAcademicDrawer={() => setIsAcademicDrawerOpen(true)}
                  onStartWorkout={handleStartWorkout}
                  onOpenSuperEditor={() => setIsSuperEditorOpen(true)}
                />
              )}

              {activeTab === 'frenzy' && (
                <FrenzyMode
                  onExit={() => setActiveTab('catalog')}
                  onOpenLeaderboard={() => setActiveTab('leaderboard')}
                />
              )}

              {activeTab === 'pachinko' && <PachinkoSalon />}

              {activeTab === 'leaderboard' && <LeaderboardView />}
            </>
          )}
        </main>
      </div>

      {/* Super Game Editor Module */}
      <SuperGameEditorModal
        isOpen={isSuperEditorOpen}
        onClose={() => setIsSuperEditorOpen(false)}
        onStartTraining={(count) => {
          setIsSuperEditorOpen(false);
          handleStartWorkout(count);
        }}
      />

      {/* Slide-over Academic Feedback & AI Tutor Drawer */}
      <AcademicFeedbackDrawer
        isOpen={isAcademicDrawerOpen}
        onClose={() => setIsAcademicDrawerOpen(false)}
      />

      {/* Theme, Biomes & Fullscreen Modal */}
      <ThemeCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
      />

      {/* Clean Contemporary Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 md:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">PoliArcade</span>
            <span aria-hidden="true">·</span>
            <span>Entorno Académico Interactivo 2D &amp; 3D</span>
            <span aria-hidden="true">·</span>
            <span>Tutor Socrático con Gemini API</span>
          </div>
          <div className="text-slate-500 font-mono text-[11px]">
            Raciocinio Temático en Tiempo Real · Responsive Mobile &amp; Desktop
          </div>
        </div>
      </footer>
    </div>
  );
}
