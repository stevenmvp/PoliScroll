import React, { useEffect, useRef, useState } from 'react';
import { type GameInstanceProps } from '../../types/game';
import { createInitialOrbitBeatState, type OrbitBeatState } from './model';
import { OrbitBeatController } from './controller';
import { ORBIT_RADII } from './assets';
import { academicStore } from '../../services/academicStore';
import { themeStore } from '../../services/themeStore';
import { VirtualController } from '../../components/VirtualController';
import { Heart, Trophy, Zap, CircleDot, GraduationCap, Maximize2, Sparkles } from 'lucide-react';

export const NeonOrbitBeatView: React.FC<GameInstanceProps> = ({
  onGameOver,
  isFrenzyMode = false,
  frenzyTimeLeft = 10,
  onScoreUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hudState, setHudState] = useState<OrbitBeatState>(createInitialOrbitBeatState());
  const [isHit, setIsHit] = useState(false);
  const [activeTopic, setActiveTopic] = useState(() => academicStore.getActiveTopic());

  const stateRef = useRef<OrbitBeatState>(createInitialOrbitBeatState());
  const controllerRef = useRef<OrbitBeatController>(new OrbitBeatController());

  // Subscribe to topic changes
  useEffect(() => {
    return academicStore.subscribe(() => {
      setActiveTopic(academicStore.getActiveTopic());
    });
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.parentElement?.clientWidth || 780;
      const h = canvas.parentElement?.clientHeight || 480;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = (time: number) => {
      animId = requestAnimationFrame(render);
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      controllerRef.current.update(stateRef.current, delta, () => {
        setIsHit(true);
        setTimeout(() => setIsHit(false), 200);
      });

      if (onScoreUpdate) {
        onScoreUpdate(stateRef.current.score);
      }
      setHudState({ ...stateRef.current });

      if (stateRef.current.gameOver && !isFrenzyMode) {
        cancelAnimationFrame(animId);
        onGameOver({
          score: stateRef.current.score,
          marblesEarned: stateRef.current.marbles,
          won: false,
          stats: {
            'Combo Máximo': `x${stateRef.current.maxCombo}`,
            'Canicas': stateRef.current.marbles,
          },
        });
        return;
      }

      const w = canvas.parentElement?.clientWidth || 780;
      const h = canvas.parentElement?.clientHeight || 480;
      const cx = w / 2;
      const cy = h / 2;

      // Clear Canvas
      ctx.clearRect(0, 0, w, h);

      // Background cosmic gradient
      const biome = themeStore.getBiome();
      const grad = ctx.createRadialGradient(cx, cy, 30, cx, cy, Math.max(w, h) / 1.3);
      if (biome.id === 'snow') {
        grad.addColorStop(0, '#0c2340');
        grad.addColorStop(1, '#050c18');
      } else if (biome.id === 'desert') {
        grad.addColorStop(0, '#2d1502');
        grad.addColorStop(1, '#0c0702');
      } else {
        grad.addColorStop(0, '#13112c');
        grad.addColorStop(1, '#050711');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Starfield Grid particles
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      for (let i = 0; i < 35; i++) {
        const sx = ((i * 12347 + time * 0.01) % w);
        const sy = ((i * 98765) % h);
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
      ctx.restore();

      // Dynamic scale
      const scaleFactor = Math.min(1.05, h / 460);
      const radii = ORBIT_RADII.map((r) => r * scaleFactor);

      // Central Pulsing Core
      const pulse = 1 + Math.sin(stateRef.current.beatPhase * Math.PI * 2) * 0.16;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 34 * scaleFactor * pulse, 0, Math.PI * 2);
      ctx.fillStyle = '#8B5CF6';
      ctx.shadowColor = '#8B5CF6';
      ctx.shadowBlur = 28 * pulse;
      ctx.fill();

      // Core inner ring
      ctx.beginPath();
      ctx.arc(cx, cy, 20 * scaleFactor, 0, Math.PI * 2);
      ctx.fillStyle = '#DDD6FE';
      ctx.fill();
      ctx.restore();

      // Render 3 Concentric Orbit Rings
      radii.forEach((r, idx) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        const isActive = idx === stateRef.current.playerOrbit;
        ctx.lineWidth = isActive ? 3 : 1.4;
        ctx.strokeStyle = isActive ? '#38BDF8' : 'rgba(148, 163, 184, 0.25)';
        if (isActive) {
          ctx.shadowColor = '#06B6D4';
          ctx.shadowBlur = 14;
        }
        ctx.stroke();
        ctx.restore();
      });

      // Render Hazards (Curved Laser Arcs)
      stateRef.current.hazards.forEach((hazard) => {
        const r = radii[hazard.orbitIndex];
        const start = hazard.angle - hazard.span / 2;
        const end = hazard.angle + hazard.span / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, start, end);
        ctx.lineWidth = 10 * scaleFactor;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#EF4444';
        ctx.shadowColor = '#EF4444';
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.restore();
      });

      // Render Academic Harmonic Notes
      stateRef.current.notes.forEach((note) => {
        const r = radii[note.orbitIndex];
        const nx = cx + Math.cos(note.angle) * r;
        const ny = cy + Math.sin(note.angle) * r;

        ctx.save();
        ctx.translate(nx, ny);

        // Rotating Resonance Diamond
        ctx.save();
        ctx.rotate(time * 0.003 + note.id);
        const size = 12 * scaleFactor;
        ctx.fillStyle = note.isCorrect ? '#10B981' : '#F59E0B';
        ctx.shadowColor = note.isCorrect ? '#34D399' : '#FBBF24';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Concept Label Tag above the note
        if (note.term) {
          ctx.font = 'bold 11px system-ui, sans-serif';
          let termText = note.term;
          if (termText.length > 16) termText = termText.slice(0, 15) + '…';
          const textW = ctx.measureText(termText).width + 14;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
          ctx.strokeStyle = note.isCorrect ? '#34D399' : '#F59E0B';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.roundRect(-textW / 2, -28, textW, 18, 5);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(termText, 0, -19);
        }

        ctx.restore();
      });

      // Render Player Marble
      const pr = radii[stateRef.current.playerOrbit];
      const px = cx + Math.cos(stateRef.current.playerAngle) * pr;
      const py = cy + Math.sin(stateRef.current.playerAngle) * pr;

      // Marble trail
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        cx + Math.cos(stateRef.current.playerAngle - 0.12) * pr,
        cy + Math.sin(stateRef.current.playerAngle - 0.12) * pr,
        9 * scaleFactor,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.fill();

      // Main Marble (High-contrast illuminated sphere)
      const marbleGrad = ctx.createRadialGradient(px - 3, py - 3, 2, px, py, 15 * scaleFactor);
      marbleGrad.addColorStop(0, '#FFFFFF');
      marbleGrad.addColorStop(0.3, '#38BDF8');
      marbleGrad.addColorStop(1, '#0284C7');
      ctx.fillStyle = marbleGrad;
      ctx.beginPath();
      ctx.arc(px, py, 14 * scaleFactor, 0, Math.PI * 2);
      ctx.shadowColor = '#38BDF8';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.restore();
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [onGameOver, isFrenzyMode, onScoreUpdate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const keysToIntercept = [' ', 'Spacebar', 'ArrowUp', 'ArrowDown', 'w', 's', 'W', 'S', 'Enter'];
      if (keysToIntercept.includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        controllerRef.current.jumpOrbit(stateRef.current, 'out');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        controllerRef.current.jumpOrbit(stateRef.current, 'in');
      } else if (e.key === 'Enter') {
        controllerRef.current.jumpOrbit(stateRef.current, 'cycle');
      }
    };
    window.addEventListener('keydown', handleKey, { capture: true, passive: false });
    return () => window.removeEventListener('keydown', handleKey, { capture: true });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-between p-2 select-none"
    >
      {/* Unified Stage Canvas */}
      <div className="relative w-full flex-1 rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-950">
        <canvas ref={canvasRef} className="block w-full h-full" />
        {isHit && (
          <div className="absolute inset-0 bg-red-600/30 pointer-events-none z-20 animate-pulse" />
        )}
      </div>

      {/* Helper Prompt & Mobile Controls */}
      <div className="w-full max-w-xl mt-1.5 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-600 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-violet-600 shrink-0" />
          <span>Salta entre órbitas para capturar conceptos válidos y esquiva láseres.</span>
        </div>

        <VirtualController
          onDirection={(dir) => {
            if (dir === 'up') controllerRef.current.jumpOrbit(stateRef.current, 'out');
            if (dir === 'down') controllerRef.current.jumpOrbit(stateRef.current, 'in');
          }}
          onAction={() => controllerRef.current.jumpOrbit(stateRef.current, 'cycle')}
          actionLabel="ÓRBITA"
          showDpad={true}
          showAction={true}
        />
      </div>
    </div>
  );
};
