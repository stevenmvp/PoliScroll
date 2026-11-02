import React, { useState, useEffect } from 'react';
import {
  arcadeConfigStore,
  type GameplayMode,
  type TrainingPreset,
  type MetronomeSpeedTier,
  METRONOME_TIERS,
} from '../services/arcadeConfigStore';
import { getAllGames } from '../games/registry';
import { soundManager } from '../services/soundManager';
import {
  Sliders,
  X,
  GraduationCap,
  Gamepad2,
  Zap,
  Clock,
  RotateCcw,
  Sparkles,
  Check,
  Search,
  Eye,
  EyeOff,
  Flame,
  Volume2,
  VolumeX,
  Play,
  Layers,
} from 'lucide-react';

interface SuperGameEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTraining?: (count: number) => void;
}

export const SuperGameEditorModal: React.FC<SuperGameEditorModalProps> = ({
  isOpen,
  onClose,
  onStartTraining,
}) => {
  const [config, setConfig] = useState(() => arcadeConfigStore.getConfig());
  const [activeTab, setActiveTab] = useState<'modes' | 'metronome' | 'games'>('modes');
  const [searchGame, setSearchGame] = useState('');

  const allGames = getAllGames();

  useEffect(() => {
    return arcadeConfigStore.subscribe(() => {
      setConfig(arcadeConfigStore.getConfig());
    });
  }, []);

  if (!isOpen) return null;

  const handleModeChange = (mode: GameplayMode) => {
    soundManager.playClick('E4');
    arcadeConfigStore.setGameplayMode(mode);
  };

  const handleTrainingPresetChange = (preset: TrainingPreset, count?: number) => {
    soundManager.playClick('A4');
    arcadeConfigStore.setTrainingPreset(preset, count);
  };

  const handleMetronomeTierChange = (tier: MetronomeSpeedTier) => {
    soundManager.playClick('C5');
    arcadeConfigStore.setMetronomeTier(tier);
  };

  const filteredGames = allGames.filter((g) => {
    const override = config.gameOverrides[g.id];
    const title = override?.customTitle || g.title;
    return title.toLowerCase().includes(searchGame.toLowerCase()) || g.category.includes(searchGame.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 leading-tight">
                  Súper Módulo de Edición de Juegos &amp; Modos
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Game Studio v2
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Alterna entre Modo Academia o Arcade Puro, ajusta entrenos, metrónomo y parámetros por juego
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Segmented Navigation Tabs */}
        <div className="px-4 sm:px-6 pt-3 bg-slate-50/70 border-b border-slate-200 flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              soundManager.playClick('C4');
              setActiveTab('modes');
            }}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'modes'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Modos &amp; Entrenamientos</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick('E4');
              setActiveTab('metronome');
            }}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'metronome'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Metrónomo de Velocidad</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick('G4');
              setActiveTab('games');
            }}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'games'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4 text-purple-500" />
            <span>Editor de Juegos ({allGames.length})</span>
          </button>
        </div>

        {/* Tab 1: Modos Globales & Entrenos */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'modes' && (
            <div className="space-y-6">
              {/* 1. Modo Maestro: Academia vs Solo Juegos */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <span>Modo Maestro del Arcade</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Determina si los juegos integran verificación socrática o funcionan como arcade clásico
                    </p>
                  </div>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    Activo: {config.gameplayMode === 'academia' ? 'Academia' : 'Solo Juegos'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => handleModeChange('academia')}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      config.gameplayMode === 'academia'
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">
                        Modo Academia (Con Raciocinio)
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Troncos, pilares, compuertas y trivia presentan conceptos reales vs distractores, registro en el Cuaderno y feedback IA.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleModeChange('arcade')}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      config.gameplayMode === 'arcade'
                        ? 'border-purple-600 bg-purple-50/50 shadow-xs ring-2 ring-purple-500/20'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">
                        Sin Academia (Solo Juegos / Arcade Puro)
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Acción retro ininterrumpida. Elimina los textos de estudio obligatorios y maximiza velocidad, reflejos y puntajes puros.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Entornos de Entrenamiento (Workouts) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <span>Entornos de Entrenamiento (Playlists)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Encadena rondas de minijuegos continuas con marcador consolidado
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => handleTrainingPresetChange('quick3')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      config.trainingPreset === 'quick3'
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                      Sprint Dinámico
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                      Entreno Rápido (3 Juegos)
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Ideal para pausas activas o calentamiento de reflejos en 2 minutos.
                    </p>
                    {onStartTraining && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                          onStartTraining(3);
                        }}
                        className="mt-3 w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Iniciar 3 Juegos</span>
                      </button>
                    )}
                  </div>

                  <div
                    onClick={() => handleTrainingPresetChange('classic5')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      config.trainingPreset === 'classic5'
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                      Desafío Estándar
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                      Entreno Clásico (5 Juegos)
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Ruta equilibrada rotando 3D, ritmo, velocidad y deducción lógica.
                    </p>
                    {onStartTraining && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                          onStartTraining(5);
                        }}
                        className="mt-3 w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Iniciar 5 Juegos</span>
                      </button>
                    )}
                  </div>

                  <div
                    onClick={() => handleTrainingPresetChange('custom')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      config.trainingPreset === 'custom'
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                      A tu Medida
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                      Entreno Personalizado
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-slate-600 font-bold">N° Juegos:</span>
                      <input
                        type="number"
                        min={2}
                        max={16}
                        value={config.customTrainingCount}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          arcadeConfigStore.setTrainingPreset('custom', val);
                        }}
                        className="w-16 px-2 py-1 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg text-center"
                      />
                    </div>
                    {onStartTraining && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                          onStartTraining(config.customTrainingCount);
                        }}
                        className="mt-2.5 w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Iniciar {config.customTrainingCount} Juegos</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Duración del Modo Frenesí */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>Calibración del Modo Frenesí</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tiempo por microjuego antes de rotar automáticamente
                    </p>
                  </div>
                  <span className="text-xs font-mono font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    {config.frenzyDuration} Segundos
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => arcadeConfigStore.setFrenzyDuration(10)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      config.frenzyDuration === 10
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    10s (Clásico)
                  </button>
                  <button
                    onClick={() => arcadeConfigStore.setFrenzyDuration(15)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      config.frenzyDuration === 15
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    15s (Extendido)
                  </button>
                  <div className="flex items-center gap-2 px-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500">Custom:</span>
                    <input
                      type="range"
                      min={5}
                      max={30}
                      step={1}
                      value={config.frenzyDuration}
                      onChange={(e) => arcadeConfigStore.setFrenzyDuration(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Metrónomo de Velocidad */}
          {activeTab === 'metronome' && (
            <div className="space-y-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>Metrónomo de Velocidad Gradual</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Escala la velocidad en 3 niveles (Lento, Medio, Rápido) para empujar tus límites cognitivos
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => arcadeConfigStore.setMetronomeAudioEnabled(!config.metronomeAudioEnabled)}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors ${
                        config.metronomeAudioEnabled
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                          : 'bg-slate-100 border-slate-200 text-slate-400'
                      }`}
                      title="Tick sonoro rítmico"
                    >
                      {config.metronomeAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      <span className="hidden sm:inline">Tick Rítmico</span>
                    </button>
                  </div>
                </div>

                {/* 3 Speed Tiers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['lento', 'medio', 'rapido'] as MetronomeSpeedTier[]).map((tier) => {
                    const info = METRONOME_TIERS[tier];
                    const isSelected = config.metronomeTier === tier;
                    return (
                      <button
                        key={tier}
                        onClick={() => handleMetronomeTierChange(tier)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            style={{ color: info.color }}
                            className="text-xs font-black uppercase tracking-wider"
                          >
                            {tier.toUpperCase()}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-600">
                            {info.bpm} BPM
                          </span>
                        </div>
                        <div className="text-base font-black text-slate-900 mt-1">
                          Velocidad {info.multiplier}x
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {tier === 'lento'
                            ? 'Ritmo base con márgenes de reacción cómodos.'
                            : tier === 'medio'
                            ? 'Pista acelerada (+35%) con ritmo estimulante.'
                            : '¡Aceleración máxima (+75%) para expertos!'}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Auto Acceleration Toggle */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Flame className="w-5 h-5 text-amber-500" />
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">
                        Aceleración Automática por Avance
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Aumenta automáticamente de Lento $\to$ Medio $\to$ Rápido conforme superas rondas en el Frenesí o Entrenamientos
                      </div>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={config.autoAccelerateMetronome}
                    onChange={(e) => arcadeConfigStore.setAutoAccelerateEnabled(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Super Editor de Juegos */}
          {activeTab === 'games' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchGame}
                    onChange={(e) => setSearchGame(e.target.value)}
                    placeholder="Buscar minijuego para editar..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <button
                  onClick={() => {
                    if (confirm('¿Restablecer todos los ajustes individuales a sus valores originales?')) {
                      arcadeConfigStore.resetAllOverrides();
                      soundManager.playClick('A3');
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer Todo</span>
                </button>
              </div>

              {/* Game Cards List */}
              <div className="space-y-3">
                {filteredGames.map((game) => {
                  const override = config.gameOverrides[game.id] || {
                    enabled: true,
                    difficulty: game.difficulty,
                    speedMultiplier: 1.0,
                  };
                  const isEnabled = override.enabled !== false;

                  return (
                    <div
                      key={game.id}
                      className={`p-4 rounded-2xl border transition-all bg-white shadow-2xs ${
                        isEnabled ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              arcadeConfigStore.updateGameOverride(game.id, { enabled: !isEnabled });
                              soundManager.playClick('C4');
                            }}
                            className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                              isEnabled
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-400 border-slate-200'
                            }`}
                            title={isEnabled ? 'Desactivar juego de la rotación' : 'Habilitar juego'}
                          >
                            {isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-slate-900">
                                {override.customTitle || game.title}
                              </span>
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                {game.category}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              {override.customInstruction || game.instruction}
                            </p>
                          </div>
                        </div>

                        {/* Speed multiplier & difficulty controls */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-500">Dificultad:</span>
                            <select
                              value={override.difficulty}
                              onChange={(e) => {
                                arcadeConfigStore.updateGameOverride(game.id, {
                                  difficulty: e.target.value as any,
                                });
                              }}
                              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-800"
                            >
                              <option value="facil">Fácil</option>
                              <option value="medio">Medio</option>
                              <option value="experto">Experto</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-500">Velocidad:</span>
                            <span className="font-mono text-xs font-bold text-indigo-700 min-w-[35px]">
                              {override.speedMultiplier || 1.0}x
                            </span>
                            <input
                              type="range"
                              min={0.8}
                              max={2.0}
                              step={0.1}
                              value={override.speedMultiplier || 1.0}
                              onChange={(e) => {
                                arcadeConfigStore.updateGameOverride(game.id, {
                                  speedMultiplier: Number(e.target.value),
                                });
                              }}
                              className="w-20 accent-indigo-600"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Quick inline title edit */}
                      <div className="pt-2.5 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Personalizar Título:</span>
                        <input
                          type="text"
                          defaultValue={override.customTitle || game.title}
                          onBlur={(e) => {
                            arcadeConfigStore.updateGameOverride(game.id, {
                              customTitle: e.target.value,
                            });
                          }}
                          className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 flex-1 max-w-xs focus:bg-white"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Todos los cambios se aplican y guardan instantáneamente en tu navegador.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
