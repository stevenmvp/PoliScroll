import React, { useState, useEffect } from 'react';
import { type GameDefinition, type GameInstanceProps } from '../../types/game';
import { soundManager } from '../../services/soundManager';
import { academicStore } from '../../services/academicStore';
import { Trophy, CircleDot, Check, Eye, PackageOpen, Sparkles, GraduationCap } from 'lucide-react';

interface ShelfItem {
  id: number;
  shape: 'sphere' | 'cube' | 'pyramid' | 'gem';
  color: string;
  name: string;
  shelfIndex: number; // 0: Top, 1: Mid, 2: Bottom
  slotIndex: number; // 0: Left, 1: Center, 2: Right
}

const SHAPES = [
  { shape: 'sphere', name: 'Esfera Cuántica', color: '#06b6d4' },
  { shape: 'cube', name: 'Cubo de Ámbar', color: '#f59e0b' },
  { shape: 'pyramid', name: 'Pirámide Violeta', color: '#8b5cf6' },
  { shape: 'gem', name: 'Gema Esmeralda', color: '#10b981' },
] as const;

export const ShelfOrganizerView: React.FC<GameInstanceProps> = ({
  onGameOver,
  onScoreUpdate,
}) => {
  const [phase, setPhase] = useState<'memorize' | 'place' | 'result'>('memorize');
  const [targetItems, setTargetItems] = useState<ShelfItem[]>([]);
  const [placedItems, setPlacedItems] = useState<{ [key: string]: ShelfItem }>({});
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<ShelfItem | null>(null);
  const [score, setScore] = useState(0);
  const [marbles, setMarbles] = useState(0);
  const [round, setRound] = useState(1);
  const [countdown, setCountdown] = useState(3.5);

  const startNewRound = (roundNum: number) => {
    setPlacedItems({});
    setSelectedInventoryItem(null);
    setPhase('memorize');
    setCountdown(3.5);

    const itemCount = Math.min(5, 2 + roundNum);
    const availableSlots: { shelf: number; slot: number }[] = [];
    for (let sh = 0; sh < 3; sh++) {
      for (let sl = 0; sl < 3; sl++) {
        availableSlots.push({ shelf: sh, slot: sl });
      }
    }
    availableSlots.sort(() => Math.random() - 0.5);

    const generated: ShelfItem[] = [];
    for (let i = 0; i < itemCount; i++) {
      const shapeDef = SHAPES[i % SHAPES.length];
      const slot = availableSlots[i];
      generated.push({
        id: i + 1,
        shape: shapeDef.shape,
        color: shapeDef.color,
        name: shapeDef.name,
        shelfIndex: slot.shelf,
        slotIndex: slot.slot,
      });
    }
    setTargetItems(generated);
  };

  useEffect(() => {
    startNewRound(1);
  }, []);

  // Memorization Timer Countdown
  useEffect(() => {
    if (phase !== 'memorize') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0.2) {
          clearInterval(timer);
          setPhase('place');
          soundManager.playClick('A4');
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [phase]);

  const handleSlotClick = (shelfIndex: number, slotIndex: number) => {
    if (phase !== 'place' || !selectedInventoryItem) return;

    const key = `${shelfIndex}-${slotIndex}`;
    const newPlaced = { ...placedItems, [key]: selectedInventoryItem };
    setPlacedItems(newPlaced);
    setSelectedInventoryItem(null);
    soundManager.playClick('E4');

    // Check if all placed
    if (Object.keys(newPlaced).length === targetItems.length) {
      let correctCount = 0;
      targetItems.forEach((target) => {
        const itemAtTarget = newPlaced[`${target.shelfIndex}-${target.slotIndex}`];
        if (itemAtTarget && itemAtTarget.id === target.id) {
          correctCount++;
        }
      });

      if (correctCount === targetItems.length) {
        soundManager.playMarbleCollect(round + 2);
        const gainedScore = 250 * round;
        const newScore = score + gainedScore;
        setScore(newScore);
        if (onScoreUpdate) onScoreUpdate(newScore);
        setMarbles((m) => m + 2);
        setPhase('result');
        academicStore.recordChoice({
          gameId: 'shelf-organizer',
          concept: `Estantería Mnemotécnica Ronda ${round}`,
          isCorrect: true,
          quickExplanation: `Memoria de posición y clasificación espacial perfecta lograda con ${targetItems.length} objetos ordenados.`,
        });
        setTimeout(() => {
          setRound((r) => r + 1);
          startNewRound(round + 1);
        }, 1400);
      } else {
        soundManager.playHit();
        academicStore.recordChoice({
          gameId: 'shelf-organizer',
          concept: `Estantería Ronda ${round}`,
          isCorrect: false,
          quickExplanation: `Discrepancia en la ubicación espacial o categorización de estantes. Revisa el patrón con calma.`,
        });
        onGameOver({ score, marblesEarned: marbles, won: false });
      }
    }
  };

  const inventoryItems = targetItems.filter((t) => !Object.values(placedItems).some((p) => p.id === t.id));

  // Render High-Resolution Vector 3D Shape
  const renderShapeIcon = (shape: string, color: string) => {
    switch (shape) {
      case 'sphere':
        return (
          <div
            className="w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-transform hover:scale-110"
            style={{
              background: `radial-gradient(circle at 30% 30%, #a5f3fc, ${color} 65%, #083344 100%)`,
            }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white/70 -translate-x-1 -translate-y-1" />
          </div>
        );
      case 'cube':
        return (
          <div
            className="w-9 h-9 rounded-xl shadow-md flex items-center justify-center transition-transform hover:scale-110 border-2 border-white/40"
            style={{
              background: `linear-gradient(135deg, #fef08a 0%, ${color} 60%, #78350f 100%)`,
            }}
          >
            <div className="w-3 h-3 rounded-md bg-white/50" />
          </div>
        );
      case 'pyramid':
        return (
          <div className="w-10 h-10 flex items-center justify-center transition-transform hover:scale-110 drop-shadow-md">
            <svg viewBox="0 0 40 40" className="w-10 h-10">
              <polygon points="20,4 36,36 4,36" fill={color} />
              <polygon points="20,4 36,36 20,36" fill="rgba(0,0,0,0.2)" />
              <polygon points="20,4 20,36 4,36" fill="rgba(255,255,255,0.25)" />
            </svg>
          </div>
        );
      case 'gem':
      default:
        return (
          <div className="w-10 h-10 flex items-center justify-center transition-transform hover:scale-110 drop-shadow-md">
            <svg viewBox="0 0 40 40" className="w-10 h-10">
              <polygon points="20,3 36,15 36,28 20,37 4,28 4,15" fill={color} />
              <polygon points="20,3 36,15 20,20 4,15" fill="rgba(255,255,255,0.3)" />
              <polygon points="36,15 36,28 20,37 20,20" fill="rgba(0,0,0,0.18)" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-full min-h-[520px] flex flex-col items-center justify-center p-3 select-none">
      {/* Top HUD */}
      <div className="w-full max-w-[420px] mb-3 flex items-center justify-between text-xs font-semibold bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-1.5 text-amber-600">
          <Trophy className="w-4 h-4" />
          <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">{score}</span>
        </div>
        <div className="text-violet-600 font-bold bg-violet-50 px-2.5 py-1 rounded-xl border border-violet-200">
          Ronda {round}
        </div>
        <div className="text-cyan-600 font-mono font-bold flex items-center gap-1">
          <CircleDot className="w-4 h-4 text-amber-500" />
          <span className="tabular-nums">+{marbles}</span>
        </div>
      </div>

      {/* Main Shelves Unit (3 Shelves x 3 Slots) */}
      <div className="w-full max-w-[410px] bg-white border border-slate-200 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        {/* Progress Bar during Memorization */}
        {phase === 'memorize' && (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-100"
              style={{ width: `${(countdown / 3.5) * 100}%` }}
            />
          </div>
        )}

        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-3">
          <span className="flex items-center gap-1.5 text-slate-800">
            {phase === 'memorize' ? <Eye className="w-4 h-4 text-cyan-600" /> : <PackageOpen className="w-4 h-4 text-amber-600" />}
            {phase === 'memorize' ? `Memoriza las posiciones (${countdown.toFixed(1)}s)` : 'Ubica los objetos en el estante'}
          </span>
          <span className="font-mono text-cyan-600 font-bold uppercase tracking-wider">
            {phase === 'memorize' ? 'OBSERVA' : 'ORGANIZA'}
          </span>
        </div>

        {/* Contemporary Lacquered Shelves Unit */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner">
          {[0, 1, 2].map((shelfIdx) => (
            <div key={shelfIdx} className="space-y-1.5">
              <div className="text-[10px] font-mono text-slate-500 font-semibold tracking-wide">
                Estante {shelfIdx === 0 ? 'Superior' : shelfIdx === 1 ? 'Medio' : 'Inferior'}
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {[0, 1, 2].map((slotIdx) => {
                  const key = `${shelfIdx}-${slotIdx}`;
                  const targetItem = targetItems.find((t) => t.shelfIndex === shelfIdx && t.slotIndex === slotIdx);
                  const placedItem = placedItems[key];

                  return (
                    <div
                      key={slotIdx}
                      onClick={() => handleSlotClick(shelfIdx, slotIdx)}
                      className={`h-18 rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer relative shadow-sm ${
                        phase === 'memorize' && targetItem
                          ? 'border-cyan-400 bg-white ring-2 ring-cyan-100'
                          : placedItem
                          ? 'border-emerald-400 bg-emerald-50/60'
                          : selectedInventoryItem
                          ? 'border-dashed border-cyan-400 bg-cyan-50/40 hover:bg-cyan-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {phase === 'memorize' && targetItem && renderShapeIcon(targetItem.shape, targetItem.color)}
                      {phase === 'place' && placedItem && renderShapeIcon(placedItem.shape, placedItem.color)}
                      {phase === 'place' && !placedItem && (
                        <span className="text-[10px] font-mono text-slate-400 font-medium">Ranura {slotIdx + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Natural Cedar Wooden Shelf Plank */}
              <div className="h-2 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 rounded-full w-full shadow-sm" />
            </div>
          ))}
        </div>

        {/* Inventory Shelf (Items to place) */}
        {phase === 'place' && (
          <div className="mt-4 pt-3 border-t border-slate-200">
            <div className="text-xs font-bold text-slate-700 mb-2">
              Toca un objeto y luego la ranura donde estaba:
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {inventoryItems.map((item) => {
                const isSelected = selectedInventoryItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedInventoryItem(item);
                      soundManager.playClick('G4');
                    }}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all active:scale-95 shrink-0 ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-50 shadow-md ring-2 ring-cyan-400 scale-105'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    {renderShapeIcon(item.shape, item.color)}
                    <span className="text-[10px] font-medium text-slate-700 max-w-[70px] truncate">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Success Banner */}
        {phase === 'result' && (
          <div className="absolute inset-0 bg-emerald-500/90 backdrop-blur-sm flex items-center justify-center text-white z-20 animate-in zoom-in-95 duration-150">
            <div className="text-center">
              <Check className="w-12 h-12 mx-auto mb-1 animate-bounce" />
              <div className="font-black text-xl">¡ESTANTERÍA PERFECTA!</div>
              <div className="text-sm font-mono mt-1 text-emerald-100">+{250 * round} PTS · +2 CANICAS</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ShelfOrganizerGame: GameDefinition = {
  id: 'shelf-organizer',
  title: 'Memory Pantry & Shelf',
  dimension: '2d',
  category: 'logic',
  difficulty: 'medio',
  tagline: 'Memoriza los objetos por color, forma y ubicación, y colócalos en la estantería exacta.',
  instruction: '¡Memoriza dónde está cada figura y ordénalas en los estantes correctos!',
  article: {
    lore: 'El almacén de reliquias cuánticas requiere precisión absoluta al clasificar artefactos por resonancia y coordenadas.',
    mechanics: 'Observa la estantería durante 3.5 segundos. Después, selecciona los objetos de tu inventario y asígnalos al estante y ranura exactos.',
    tips: [
      'Agrupa mentalmente los objetos por estante (Superior, Medio, Inferior) para recordarlos fácilmente.',
      'Organizar todo el mueble sin errores otorga canicas doradas directas a tu cuenta.',
    ],
  },
  controlsDescription: {
    desktop: 'Clic sobre los objetos y luego sobre el hueco del estante',
    mobile: 'Toca el objeto y pulsa la casilla del estante en pantalla',
  },
  icon: 'Layers',
  color: '#06B6D4',
  accentColor: '#F59E0B',
  unlockedByDefault: true,
  unlockCost: 0,
  Component: ShelfOrganizerView,
};
