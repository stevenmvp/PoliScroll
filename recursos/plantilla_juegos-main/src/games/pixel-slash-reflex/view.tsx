import React, { useEffect, useRef, useState, useCallback } from 'react';
import { type GameInstanceProps } from '../../types/game';
import { createInitialPixelSlashState, type PixelSlashState, type SlashDirection } from './model';
import { PixelSlashController } from './controller';
import { academicStore } from '../../services/academicStore';
import { themeStore } from '../../services/themeStore';
import { VirtualController } from '../../components/VirtualController';
import { Heart, Trophy, Zap, CircleDot, GraduationCap, Maximize2, Sparkles } from 'lucide-react';

export const PixelSlashReflexView: React.FC<GameInstanceProps> = ({
  onGameOver,
  isFrenzyMode = false,
  frenzyTimeLeft = 10,
  onScoreUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hudState, setHudState] = useState<PixelSlashState>(createInitialPixelSlashState());
  const [isHit, setIsHit] = useState(false);
  const [activeTopic, setActiveTopic] = useState(() => academicStore.getActiveTopic());

  const stateRef = useRef<PixelSlashState>(createInitialPixelSlashState());
  const controllerRef = useRef<PixelSlashController>(new PixelSlashController());

  // Subscribe to topic
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

  const executeSlash = useCallback((dir: SlashDirection) => {
    if (!canvasRef.current?.parentElement) return;
    const cx = canvasRef.current.parentElement.clientWidth / 2;
    const cy = canvasRef.current.parentElement.clientHeight / 2;
    controllerRef.current.slash(stateRef.current, dir, cx, cy);
  }, []);

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
      const strikeRadius = 48;
      const spawnDistance = Math.min(w, h) * 0.44;

      ctx.clearRect(0, 0, w, h);

      // Background vignette based on Biome
      const biome = themeStore.getBiome();
      const grad = ctx.createRadialGradient(cx, cy, 30, cx, cy, Math.max(w, h) / 1.3);
      if (biome.id === 'snow') {
        grad.addColorStop(0, '#0f2744');
        grad.addColorStop(1, '#050d18');
      } else if (biome.id === 'desert') {
        grad.addColorStop(0, '#331904');
        grad.addColorStop(1, '#0d0702');
      } else {
        grad.addColorStop(0, '#11192e');
        grad.addColorStop(1, '#050811');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Central Reticle (Strike Zone)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, strikeRadius, 0, Math.PI * 2);
      ctx.strokeStyle = stateRef.current.combo > 0 ? '#38BDF8' : '#334155';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Outer targeting pulse
      const reticlePulse = 1 + Math.sin(time * 0.006) * 0.06;
      ctx.beginPath();
      ctx.arc(cx, cy, strikeRadius * 1.35 * reticlePulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner crosshairs
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - strikeRadius - 16, cy);
      ctx.lineTo(cx + strikeRadius + 16, cy);
      ctx.moveTo(cx, cy - strikeRadius - 16);
      ctx.lineTo(cx, cy + strikeRadius + 16);
      ctx.stroke();
      ctx.restore();

      // Render incoming blade targets
      stateRef.current.targets.forEach((t) => {
        const curDist = spawnDistance * (1 - t.progress);
        let tx = cx;
        let ty = cy;
        let angle = 0;

        if (t.dir === 'left') {
          tx = cx - curDist;
          angle = 0;
        } else if (t.dir === 'right') {
          tx = cx + curDist;
          angle = Math.PI;
        } else if (t.dir === 'up') {
          ty = cy - curDist;
          angle = Math.PI / 2;
        } else if (t.dir === 'down') {
          ty = cy + curDist;
          angle = -Math.PI / 2;
        }

        const inStrikeZone = Math.abs(t.progress - 1.0) < 0.18;

        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(angle);

        // Blade Arrow Vector
        ctx.beginPath();
        ctx.moveTo(24, 0);
        ctx.lineTo(-14, -13);
        ctx.lineTo(-6, 0);
        ctx.lineTo(-14, 13);
        ctx.closePath();

        ctx.fillStyle = inStrikeZone ? '#F59E0B' : '#06B6D4';
        ctx.shadowColor = inStrikeZone ? '#F59E0B' : '#06B6D4';
        ctx.shadowBlur = inStrikeZone ? 22 : 12;
        ctx.fill();
        ctx.restore();

        // Render concept label card next to projectile
        if (t.term) {
          ctx.save();
          ctx.font = 'bold 11px system-ui, sans-serif';
          const textW = ctx.measureText(t.term).width + 16;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = inStrikeZone ? '#F59E0B' : '#38BDF8';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.roundRect(tx - textW / 2, ty + 18, textW, 20, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(t.term, tx, ty + 28);
          ctx.restore();
        }
      });

      // Render Active Slash Blade Trail Animation
      if (stateRef.current.activeSlashAnimation) {
        const { dir } = stateRef.current.activeSlashAnimation;
        ctx.save();
        ctx.beginPath();
        if (dir === 'left') {
          ctx.moveTo(cx + 85, cy - 35);
          ctx.lineTo(cx - 95, cy + 35);
        } else if (dir === 'right') {
          ctx.moveTo(cx - 85, cy - 35);
          ctx.lineTo(cx + 95, cy + 35);
        } else if (dir === 'up') {
          ctx.moveTo(cx - 35, cy + 85);
          ctx.lineTo(cx + 35, cy - 95);
        } else if (dir === 'down') {
          ctx.moveTo(cx - 35, cy - 85);
          ctx.lineTo(cx + 35, cy + 95);
        }
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#FFFFFF';
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 26;
        ctx.stroke();
        ctx.restore();
      }

      // Render Sparks & Particles
      stateRef.current.particles.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.life * 4.5), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      });
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
      const keysToIntercept = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's', 'A', 'D', 'W', 'S'];
      const isAction = keysToIntercept.includes(e.key);
      if (isAction) {
        e.preventDefault();
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        executeSlash('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        executeSlash('right');
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        executeSlash('up');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        executeSlash('down');
      }
    };
    window.addEventListener('keydown', handleKey, { passive: false });
    return () => window.removeEventListener('keydown', handleKey);
  }, [executeSlash]);

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
          <Sparkles className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
          <span>Corta en la dirección del proyectil cuando entre al círculo central con WASD o Flechas.</span>
        </div>

        <VirtualController
          onDirection={(dir) => executeSlash(dir)}
          showDpad={true}
          showAction={false}
        />
      </div>
    </div>
  );
};
