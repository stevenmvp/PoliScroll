import React, { useState } from 'react';
import type { GameDefinition } from '../types/game';

const PALETTE: Record<string, [string, string]> = {
  '3d': ['#0ea5e9', '#6366f1'],
  rhythm: ['#ec4899', '#8b5cf6'],
  reflex: ['#f59e0b', '#ef4444'],
  logic: ['#10b981', '#06b6d4'],
  all: ['#6366f1', '#8b5cf6'],
};

const IMAGE_EXTENSIONS = ['webp', 'gif', 'png', 'jpg'];

const isHex = (value: string): boolean => /^#[0-9a-f]{3,8}$/i.test(value);

export function gameColors(game: GameDefinition): [string, string] {
  const key = game.dimension === '3d' ? '3d' : game.category;
  const fallback = PALETTE[key] ?? PALETTE.all;
  return [isHex(game.color) ? game.color : fallback[0], isHex(game.accentColor) ? game.accentColor : fallback[1]];
}

function Scene({ kind, primary, accent }: { kind: string; primary: string; accent: string }): React.ReactElement {
  if (kind === 'rhythm') {
    return (
      <g>
        {[0, 1, 2, 3].map((lane) => (
          <g key={lane}>
            <rect x={40 + lane * 62} y={0} width={44} height={180} fill="#ffffff" opacity={0.07} />
            <rect className="ps-prev-fall" x={46 + lane * 62} y={-30} width={32} height={14} rx={7} fill={lane % 2 ? accent : '#ffffff'} style={{ animationDelay: `${lane * -0.55}s`, animationDuration: `${1.8 + lane * 0.25}s` }} />
          </g>
        ))}
        {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
          <rect key={bar} className="ps-prev-bar" x={30 + bar * 38} y={140} width={20} height={40} rx={4} fill={primary} opacity={0.85} style={{ animationDelay: `${bar * -0.17}s` }} />
        ))}
      </g>
    );
  }
  if (kind === 'reflex') {
    return (
      <g>
        <rect x={0} y={140} width={320} height={40} fill="#000000" opacity={0.22} />
        <line x1={0} y1={140} x2={320} y2={140} stroke="#ffffff" strokeOpacity={0.5} strokeWidth={2} />
        <rect className="ps-prev-obstacle" x={330} y={108} width={26} height={32} rx={5} fill={accent} />
        <rect className="ps-prev-obstacle" x={330} y={118} width={20} height={22} rx={5} fill="#ffffff" style={{ animationDelay: '-1.4s' }} />
        <g className="ps-prev-hop"><rect x={64} y={104} width={32} height={36} rx={8} fill="#ffffff" /><circle cx={86} cy={118} r={4} fill={primary} /></g>
      </g>
    );
  }
  if (kind === 'logic') {
    return (
      <g>
        {Array.from({ length: 12 }).map((_, index) => (
          <rect key={index} className="ps-prev-tile" x={62 + (index % 4) * 54} y={26 + Math.floor(index / 4) * 44} width={44} height={36} rx={9} fill="#ffffff" style={{ animationDelay: `${((index * 5) % 12) * -0.3}s` }} />
        ))}
        <circle cx={280} cy={30} r={8} fill={accent} className="ps-prev-pulse" />
      </g>
    );
  }
  return (
    <g>
      {[0, 1, 2, 3, 4, 5].map((line) => (
        <line key={line} className="ps-prev-floor" x1={0} x2={320} y1={110} y2={110} stroke="#ffffff" strokeOpacity={0.45} strokeWidth={1.5} style={{ animationDelay: `${line * -0.5}s` }} />
      ))}
      {[-3, -2, -1, 0, 1, 2, 3].map((spoke) => (
        <line key={spoke} x1={160 + spoke * 10} y1={110} x2={160 + spoke * 70} y2={180} stroke="#ffffff" strokeOpacity={0.3} />
      ))}
      <g className="ps-prev-spin" style={{ transformOrigin: '160px 66px' }}>
        <polygon points="160,26 196,66 160,106 124,66" fill={accent} opacity={0.95} />
        <polygon points="160,26 196,66 160,66" fill="#ffffff" opacity={0.35} />
      </g>
    </g>
  );
}

interface GamePreviewProps {
  game: GameDefinition;
  className?: string;
  locked?: boolean;
}

// Muestra una imagen/GIF propio desde public/games/<id>.* y, si no existe, una escena animada por categoría.
export const GamePreview: React.FC<GamePreviewProps> = ({ game, className = '', locked = false }) => {
  const [extensionIndex, setExtensionIndex] = useState(0);
  const [primary, accent] = gameColors(game);
  const kind = game.dimension === '3d' ? '3d' : game.category;
  const imageUrl = extensionIndex < IMAGE_EXTENSIONS.length ? `${import.meta.env.BASE_URL}games/${game.id}.${IMAGE_EXTENSIONS[extensionIndex]}` : null;

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}>
      <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <Scene kind={kind} primary={primary} accent={accent} />
      </svg>
      {imageUrl && (
        <img
          key={imageUrl}
          src={imageUrl}
          alt={`Vista previa de ${game.title}`}
          loading="lazy"
          onError={() => setExtensionIndex((index) => index + 1)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
      {locked && <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-[1px]" />}
    </div>
  );
};
