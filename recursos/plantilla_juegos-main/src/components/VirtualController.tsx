import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Zap } from 'lucide-react';

interface VirtualControllerProps {
  onDirection: (dir: 'left' | 'right' | 'up' | 'down') => void;
  onAction?: () => void;
  actionLabel?: string;
  showDpad?: boolean;
  showAction?: boolean;
}

export const VirtualController: React.FC<VirtualControllerProps> = ({
  onDirection,
  onAction,
  actionLabel = 'ACCION',
  showDpad = true,
  showAction = true,
}) => {
  return (
    <div className="md:hidden fixed bottom-3 left-0 right-0 px-4 flex items-center justify-between pointer-events-none z-40">
      {/* Directional Pad */}
      {showDpad && (
        <div className="pointer-events-auto grid grid-cols-3 gap-1 bg-slate-900/80 p-2 rounded-2xl border border-slate-700/60 backdrop-blur-md shadow-xl">
          <div />
          <button
            type="button"
            onTouchStart={(e) => { e.preventDefault(); onDirection('up'); }}
            onClick={() => onDirection('up')}
            className="w-11 h-11 flex items-center justify-center bg-slate-800 active:bg-violet-600 text-slate-200 rounded-xl transition-colors shadow-inner"
            aria-label="Arriba"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />

          <button
            type="button"
            onTouchStart={(e) => { e.preventDefault(); onDirection('left'); }}
            onClick={() => onDirection('left')}
            className="w-11 h-11 flex items-center justify-center bg-slate-800 active:bg-violet-600 text-slate-200 rounded-xl transition-colors shadow-inner"
            aria-label="Izquierda"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-11 h-11 flex items-center justify-center text-slate-600 text-xs font-mono font-bold">
            DPAD
          </div>
          <button
            type="button"
            onTouchStart={(e) => { e.preventDefault(); onDirection('right'); }}
            onClick={() => onDirection('right')}
            className="w-11 h-11 flex items-center justify-center bg-slate-800 active:bg-violet-600 text-slate-200 rounded-xl transition-colors shadow-inner"
            aria-label="Derecha"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div />
          <button
            type="button"
            onTouchStart={(e) => { e.preventDefault(); onDirection('down'); }}
            onClick={() => onDirection('down')}
            className="w-11 h-11 flex items-center justify-center bg-slate-800 active:bg-violet-600 text-slate-200 rounded-xl transition-colors shadow-inner"
            aria-label="Abajo"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <div />
        </div>
      )}

      {/* Action Button */}
      {showAction && onAction && (
        <button
          type="button"
          onTouchStart={(e) => { e.preventDefault(); onAction(); }}
          onClick={() => onAction()}
          className="pointer-events-auto ml-auto px-5 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 active:from-violet-500 active:to-indigo-500 text-white font-bold rounded-2xl border border-violet-400/40 shadow-xl flex items-center gap-2 text-sm tracking-wide active:scale-95 transition-all"
        >
          <Zap className="w-5 h-5 text-amber-300" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
