import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { type GameInstanceProps } from '../../types/game';
import { createInitialPachinkoState, type PachinkoState } from './model';
import { PachinkoController } from './controller';
import { PACHINKO_CONFIG } from './assets';
import { progressionStore } from '../../services/progressionStore';
import { themeStore } from '../../services/themeStore';
import { soundManager } from '../../services/soundManager';
import { Trophy, CircleDot, Sparkles, ChevronLeft, ChevronRight, Zap, Maximize2 } from 'lucide-react';

export const PachinkoDropView: React.FC<GameInstanceProps> = ({
  onScoreUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hudState, setHudState] = useState<PachinkoState>(createInitialPachinkoState());
  const [isPressing, setIsPressing] = useState(false);
  const [chargeProgress, setChargeProgress] = useState(0);

  const stateRef = useRef<PachinkoState>(createInitialPachinkoState());
  const controllerRef = useRef<PachinkoController>(new PachinkoController());

  // Hold to Charge handlers
  const handlePressStart = () => {
    if (stateRef.current.marblesAvailable <= 0) {
      soundManager.playHit();
      return;
    }
    setIsPressing(true);
    stateRef.current.isCharging = true;
    stateRef.current.chargePower = 15;
    soundManager.playClick('A3');
  };

  const handlePressEnd = useCallback(() => {
    if (!stateRef.current.isCharging) return;
    setIsPressing(false);
    const marbleStyle = themeStore.getMarbleStyle();
    controllerRef.current.launchChargedMarble(
      stateRef.current,
      marbleStyle.color,
      marbleStyle.glow
    );
    setChargeProgress(0);
    setHudState({ ...stateRef.current });
  }, []);

  const switchLauncher = (side: 'left' | 'right') => {
    soundManager.playClick('E4');
    controllerRef.current.setLauncherSide(stateRef.current, side);
    setHudState({ ...stateRef.current });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = PACHINKO_CONFIG.boardWidth;
    const h = PACHINKO_CONFIG.boardHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const render = (now: number) => {
      animId = requestAnimationFrame(render);
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Charge update
      if (stateRef.current.isCharging) {
        controllerRef.current.updateCharge(stateRef.current, delta);
        setChargeProgress(stateRef.current.chargePower);
      }

      controllerRef.current.update(stateRef.current, delta, (marblesWon, isJackpot) => {
        if (marblesWon > 0) {
          progressionStore.addMarbles(marblesWon);
        }
        if (isJackpot) {
          confetti({ particleCount: 90, spread: 100, origin: { y: 0.65 } });
        }
      });

      if (onScoreUpdate) {
        onScoreUpdate(stateRef.current.score);
      }
      setHudState({ ...stateRef.current });

      ctx.clearRect(0, 0, w, h);

      // 1. Clean Contemporary Board Background
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle metallic gridlines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 20; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Board Outer Border
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, w - 4, h - 4);

      // 2. Visible TOP Mechanical Launcher Chambers at y=0..45
      // Left Launcher Funnel Tube
      const isLeft = stateRef.current.selectedLauncher === 'left';
      ctx.save();
      ctx.fillStyle = isLeft ? '#06b6d4' : '#1e293b';
      ctx.strokeStyle = isLeft ? '#22d3ee' : '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(40, 8, 30, 24, 6);
      ctx.fill();
      ctx.stroke();

      // Right Launcher Funnel Tube
      const isRight = stateRef.current.selectedLauncher === 'right';
      ctx.fillStyle = isRight ? '#f59e0b' : '#1e293b';
      ctx.strokeStyle = isRight ? '#fbbf24' : '#334155';
      ctx.beginPath();
      ctx.roundRect(w - 70, 8, 30, 24, 6);
      ctx.fill();
      ctx.stroke();

      // Top trajectory arches from funnels to playfield
      ctx.strokeStyle = isLeft ? 'rgba(6, 182, 212, 0.5)' : 'rgba(51, 65, 85, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(55, 32);
      ctx.quadraticCurveTo(80, 80, 130, 110);
      ctx.stroke();

      ctx.strokeStyle = isRight ? 'rgba(245, 158, 11, 0.5)' : 'rgba(51, 65, 85, 0.3)';
      ctx.beginPath();
      ctx.moveTo(w - 55, 32);
      ctx.quadraticCurveTo(w - 80, 80, w - 130, 110);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 3. Horizontal Oscillating Deflection Bumpers in mid-board
      stateRef.current.bumpers.forEach((bumper) => {
        ctx.save();
        const halfW = bumper.width / 2;
        const halfH = bumper.height / 2;

        // Glowing shadow
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 8;

        // Bumper Body
        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(
          bumper.currentX - halfW,
          bumper.y - halfH,
          bumper.width,
          bumper.height,
          5
        );
        ctx.fill();
        ctx.stroke();

        // High-contrast center energy strip
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bumper.currentX - halfW + 6, bumper.y - 1.5, bumper.width - 12, 3);
        ctx.restore();
      });

      // 4. Circular Jackpot Ring Pockets (Penultimate line & 7th line)
      stateRef.current.ringPockets.forEach((pocket) => {
        ctx.save();
        // Pulsing glow
        ctx.shadowColor = pocket.color;
        ctx.shadowBlur = pocket.isJackpot ? 16 : 8;

        // Outer Ring
        ctx.strokeStyle = pocket.color;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, pocket.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Pocket Basin
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fill();

        // Center Target Core
        ctx.fillStyle = pocket.color;
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Label above pocket
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(pocket.label, pocket.x, pocket.y - pocket.radius - 4);
        ctx.restore();
      });

      // 5. Pins Array (Metallic Pegs + Rotating Spinner Stars)
      stateRef.current.pins.forEach((pin) => {
        ctx.save();
        if (pin.isRotatingSpinner) {
          // Rotating Spinner Pin
          ctx.translate(pin.x, pin.y);
          ctx.rotate(pin.angle || 0);

          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 8;
          ctx.strokeStyle = '#c084fc';
          ctx.fillStyle = '#7e22ce';
          ctx.lineWidth = 2;

          // Draw 4-point spinner star
          ctx.beginPath();
          for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.rect(-2, -pin.radius - 2, 4, pin.radius + 2);
          }
          ctx.fill();
          ctx.stroke();

          // Center brass hub
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Standard Polished Pin
          ctx.beginPath();
          ctx.arc(pin.x, pin.y, pin.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#cbd5e1';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 4;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(pin.x - 1, pin.y - 1, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
        ctx.restore();
      });

      // 6. Bottom Collector Slots
      const slotY = h - 28;
      stateRef.current.bottomSlots.forEach((slot) => {
        ctx.save();
        ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
        ctx.strokeStyle = slot.color;
        ctx.lineWidth = 2;
        ctx.fillRect(slot.x, slotY, slot.width, 24);
        ctx.strokeRect(slot.x, slotY, slot.width, 24);

        // Slot Divider Pegs
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(slot.x - 2, slotY - 6, 4, 30);
        ctx.fillRect(slot.x + slot.width - 2, slotY - 6, 4, 30);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(slot.label, slot.x + slot.width / 2, slotY + 16);
        ctx.restore();
      });

      // 7. Marbles in Flight
      stateRef.current.marblesInFlight.forEach((m) => {
        ctx.save();
        ctx.shadowColor = m.glow;
        ctx.shadowBlur = 10;
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();

        // Shiny reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(m.x - 2, m.y - 2, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [onScoreUpdate]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[580px] flex flex-col items-center justify-center p-3 select-none"
    >
      {/* Top HUD: Marbles & Launcher Selector */}
      <div className="w-full max-w-[420px] mb-3 flex items-center justify-between px-3.5 py-2 bg-white/95 rounded-2xl border border-slate-200 text-xs shadow-sm">
        <div className="flex items-center gap-1.5">
          <CircleDot className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-slate-600">Canicas:</span>
          <span className="font-mono font-black text-amber-600 text-sm tabular-nums">
            {hudState.marblesAvailable}
          </span>
        </div>

        {/* Launcher Side Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => switchLauncher('left')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              hudState.selectedLauncher === 'left'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lanzador Izq
          </button>
          <button
            onClick={() => switchLauncher('right')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              hudState.selectedLauncher === 'right'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lanzador Der
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-amber-600 font-bold font-mono">
            <Trophy className="w-4 h-4" />
            <span>{hudState.score}</span>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            title="Pantalla Completa"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Pachinko Canvas */}
      <div className="relative my-2 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
        <canvas ref={canvasRef} />
      </div>

      {/* Bottom Hold to Charge Controller */}
      <div className="w-full max-w-[380px] flex flex-col items-center gap-2">
        {/* Dynamic Pressure Bar */}
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700 p-0.5">
          <div
            className="h-full rounded-full transition-all duration-75 bg-gradient-to-r from-cyan-500 via-amber-400 to-rose-500"
            style={{ width: `${chargeProgress}%` }}
          />
        </div>

        <div className="w-full flex items-center justify-between gap-3">
          <button
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            disabled={hudState.marblesAvailable <= 0}
            className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
              hudState.marblesAvailable <= 0
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : isPressing
                ? 'bg-amber-400 text-slate-950 scale-98 ring-4 ring-amber-400/30'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white'
            }`}
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>
              {hudState.marblesAvailable <= 0
                ? 'Sin Canicas'
                : isPressing
                ? `Cargando Fuerza (${Math.round(chargeProgress)}%)... ¡Suelta!`
                : 'Mantén Oprimido para Disparar'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
