import React, { useState, useEffect } from 'react';
import {
  themeStore,
  BIOMES,
  MARBLE_STYLES,
} from '../services/themeStore';
import {
  type BiomeType,
  type MarbleStyleId,
  type UIButtonStyle,
} from '../types/theme';
import { soundManager } from '../services/soundManager';
import {
  Palette,
  Maximize2,
  Minimize2,
  Sparkles,
  Mountain,
  Sun,
  Trees,
  Cpu,
  CircleDot,
  Check,
  X,
} from 'lucide-react';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [settings, setSettings] = useState(themeStore.getSettings());

  useEffect(() => {
    return themeStore.subscribe(() => {
      setSettings(themeStore.getSettings());
    });
  }, []);

  if (!isOpen) return null;

  const handleSelectBiome = (b: BiomeType) => {
    soundManager.playClick('C5');
    themeStore.setBiome(b);
  };

  const handleSelectMarble = (m: MarbleStyleId) => {
    soundManager.playClick('E4');
    themeStore.setMarbleStyle(m);
  };

  const handleSelectUI = (u: UIButtonStyle) => {
    soundManager.playClick('G4');
    themeStore.setUIStyle(u);
  };

  const handleToggleFullscreen = async () => {
    soundManager.playClick('A4');
    await themeStore.toggleFullscreen();
  };

  const biomeIcons: Record<BiomeType, React.ReactNode> = {
    snow: <Mountain className="w-5 h-5 text-sky-500" />,
    desert: <Sun className="w-5 h-5 text-amber-500" />,
    jungle: <Trees className="w-5 h-5 text-emerald-500" />,
    cyber: <Cpu className="w-5 h-5 text-indigo-500" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                Personalización &amp; Entornos
              </h2>
              <p className="text-xs text-slate-500">
                Configura biomas de paisajes, color de canicas y modo inmersivo
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick('A3');
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Section 1: Fullscreen Native Toggle */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900">
                  Pantalla Completa Nativa
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Recomendado
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Ocupa toda la pantalla nativamente. Previene colisiones con teclas de desplazamiento del navegador y garantiza proporciones perfectas.
              </p>
            </div>
            <button
              onClick={handleToggleFullscreen}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 ${
                settings.isFullscreen
                  ? 'bg-rose-500 hover:bg-rose-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {settings.isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4" />
                  <span>Salir Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span>Activar Pantalla Completa</span>
                </>
              )}
            </button>
          </div>

          {/* Section 2: Biomes & Landscape Environments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                1. Biomas &amp; Entornos de Paisaje (2D &amp; 3D)
              </span>
              <span className="text-xs text-slate-400">
                Afecta cielos, montañas, niebla y arenas
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(BIOMES) as BiomeType[]).map((key) => {
                const biome = BIOMES[key];
                const isSelected = settings.activeBiome === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectBiome(key)}
                    className={`text-left p-3.5 rounded-2xl border transition-all relative ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                          {biomeIcons[key]}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {biome.name}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">
                            {biome.tagline}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Collectible Marble Styles */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                2. Canica Activa &amp; Material de Colección
              </span>
              <span className="text-xs text-slate-400">
                Se refleja en Pachinko, Gachapón y minijuegos
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {MARBLE_STYLES.map((style) => {
                const isSelected = settings.activeMarbleStyle === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => handleSelectMarble(style.id)}
                    className={`text-left p-3 rounded-2xl border transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="w-7 h-7 rounded-full shadow-md flex items-center justify-center border border-white/60 relative"
                        style={{
                          backgroundColor: style.color,
                          boxShadow: `0 0 10px ${style.glow}`,
                        }}
                      >
                        <div className="w-2 h-2 rounded-full bg-white/80 absolute top-1 left-1" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {style.rarity}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {style.name}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: UI Button Style */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                3. Estilo de Botones e Interfaz
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'modern', label: 'Limpio & Elevado', desc: 'Fondos blancos y bordes nítidos' },
                { id: 'fluorescent', label: 'Fluorescente', desc: 'Acentos vivos de alto contraste' },
                { id: 'retro', label: 'Arcade Editorial', desc: 'Tipografía monospace y badges' },
              ].map((ui) => {
                const isSelected = settings.activeUIStyle === ui.id;
                return (
                  <button
                    key={ui.id}
                    onClick={() => handleSelectUI(ui.id as UIButtonStyle)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">{ui.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{ui.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Los cambios se aplican automáticamente en tiempo real
          </span>
          <button
            onClick={() => {
              soundManager.playClick('A3');
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
