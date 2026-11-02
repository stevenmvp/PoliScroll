import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { type GameDefinition, type GameInstanceProps } from '../../types/game';
import { soundManager } from '../../services/soundManager';
import { academicStore } from '../../services/academicStore';
import { SolvabilityVerifier } from '../../services/solvabilityVerifier';
import { Trophy, Zap, Shield, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';

interface TrackItem {
  id: string;
  lane: number; // 0, 1, 2
  y: number;
  isHazard: boolean;
  term: string;
  isCorrect: boolean;
  explanation: string;
  mistakenOrigin?: string;
  collected?: boolean;
}

interface SpeedLine {
  x: number;
  y: number;
  len: number;
  speed: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

export const VelocitySonicDriftView: React.FC<GameInstanceProps> = ({
  onGameOver,
  isFrenzyMode = false,
  onScoreUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [score, setScore] = useState(0);
  const [speedMph, setSpeedMph] = useState(240);
  const [shield, setShield] = useState(3);
  const [warpActive, setWarpActive] = useState(false);
  const [activeTopic, setActiveTopic] = useState(() => academicStore.getActiveTopic());

  useEffect(() => {
    return academicStore.subscribe(() => {
      setActiveTopic(academicStore.getActiveTopic());
    });
  }, []);

  const stateRef = useRef({
    playerLane: 1, // 0 (left), 1 (center), 2 (right)
    targetX: 335,
    currentX: 335,
    score: 0,
    speed: 380, // pixels/sec
    shield: 3,
    items: [] as TrackItem[],
    speedLines: [] as SpeedLine[],
    particles: [] as Particle[],
    lastRowSpawnY: 0,
    warpTimeRemaining: 0,
    gameOver: false,
  });

  // Solvability-verified obstacle row generator
  const spawnRow = useCallback(() => {
    const pool = academicStore.getRandomItemPool(4);
    const correctItem = pool.find((i) => i.isCorrect) || {
      term: activeTopic.correctItems[0]?.term || 'Boost',
      isCorrect: true,
      explanation: 'Concepto legítimo verificado.',
    };
    const distractorItem = pool.find((i) => !i.isCorrect) || {
      term: activeTopic.distractorItems[0]?.term || 'Barrera',
      isCorrect: false,
      explanation: 'Distractor erróneo.',
      mistakenOrigin: activeTopic.distractorItems[0]?.mistakenOrigin,
    };

    // Define random 3-lane assignment
    const rawObstacles = [
      { lane: 0, isHazard: Math.random() > 0.4 },
      { lane: 1, isHazard: Math.random() > 0.4 },
      { lane: 2, isHazard: Math.random() > 0.4 },
    ];

    // SOLVABILITY VERIFIER: Guarantee at least one lane is completely clear / safe!
    const verified = SolvabilityVerifier.verifySpeedLanes(3, rawObstacles);

    const newItems: TrackItem[] = [];
    for (let l = 0; l < 3; l++) {
      const isHaz = verified.obstacles.some((o) => o.lane === l && o.isHazard);
      const isTargetSafe = l === verified.safeLane;

      if (isTargetSafe) {
        // Place guaranteed verified academic concept boost gate
        newItems.push({
          id: `item-${Date.now()}-${l}`,
          lane: l,
          y: -60,
          isHazard: false,
          term: correctItem.term,
          isCorrect: true,
          explanation: correctItem.explanation,
        });
      } else if (isHaz) {
        // Place distractor barrier
        newItems.push({
          id: `haz-${Date.now()}-${l}`,
          lane: l,
          y: -60,
          isHazard: true,
          term: distractorItem.term,
          isCorrect: false,
          explanation: distractorItem.explanation,
          mistakenOrigin: distractorItem.mistakenOrigin,
        });
      }
    }

    stateRef.current.items.push(...newItems);
  }, [activeTopic]);

  // Steer controls
  const steer = useCallback((dir: -1 | 1) => {
    const state = stateRef.current;
    if (state.gameOver) return;
    const nextLane = Math.max(0, Math.min(2, state.playerLane + dir));
    if (nextLane !== state.playerLane) {
      state.playerLane = nextLane;
      soundManager.playClick('A4');
    }
  }, []);

  // Keyboard controls [ArrowLeft, ArrowRight, A, D]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        steer(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        steer(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [steer]);

  // Initialize speed background lines
  useEffect(() => {
    stateRef.current.speedLines = Array.from({ length: 25 }, () => ({
      x: 120 + Math.random() * 430,
      y: Math.random() * 560,
      len: 20 + Math.random() * 50,
      speed: 300 + Math.random() * 400,
    }));
  }, []);

  // Main 60FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const state = stateRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Accelerate speed gradually
      state.speed = Math.min(780, state.speed + dt * 14);
      setSpeedMph(Math.round(state.speed * 0.7));

      if (state.warpTimeRemaining > 0) {
        state.warpTimeRemaining -= dt;
        if (state.warpTimeRemaining <= 0) setWarpActive(false);
      }

      // Smooth horizontal interpolation to target lane (Lanes at X: 195, 335, 475)
      const laneCoords = [195, 335, 475];
      state.targetX = laneCoords[state.playerLane];
      state.currentX += (state.targetX - state.currentX) * 16 * dt;

      // Spawn rows of obstacles
      state.lastRowSpawnY += state.speed * dt;
      if (state.lastRowSpawnY > 230) {
        spawnRow();
        state.lastRowSpawnY = 0;
      }

      // Update speed lines
      for (const line of state.speedLines) {
        line.y += (state.speed + line.speed) * dt;
        if (line.y > height) {
          line.y = -line.len;
          line.x = 120 + Math.random() * 430;
        }
      }

      // Update track items & collision check
      const playerY = 460;
      const playerRadius = 26;

      for (const item of state.items) {
        item.y += state.speed * dt;
        const itemX = laneCoords[item.lane];

        if (!item.collected && Math.abs(item.y - playerY) < 32 && Math.abs(state.currentX - itemX) < 42) {
          item.collected = true;

          if (item.isHazard) {
            // Collision with barrier distractor
            soundManager.playHit();
            state.shield = Math.max(0, state.shield - 1);
            setShield(state.shield);

            academicStore.recordChoice({
              gameId: 'velocity-sonic-drift',
              concept: item.term,
              isCorrect: false,
              mistakenOrigin: item.mistakenOrigin,
              quickExplanation: item.explanation,
            });

            // Explosion particles
            for (let i = 0; i < 20; i++) {
              const a = Math.random() * Math.PI * 2;
              const sp = 60 + Math.random() * 150;
              state.particles.push({
                x: itemX,
                y: playerY,
                vx: Math.cos(a) * sp,
                vy: Math.sin(a) * sp,
                size: 3 + Math.random() * 4,
                color: '#ef4444',
                alpha: 1,
              });
            }

            if (state.shield <= 0 && !state.gameOver) {
              state.gameOver = true;
              onGameOver({
                score: state.score,
                marblesEarned: Math.floor(state.score / 200),
                won: false,
                stats: {
                  'Velocidad Máxima': `${Math.round(state.speed * 0.7)} MPH`,
                  'Puntaje': state.score,
                },
              });
            }
          } else {
            // Collected verified concept boost gate!
            soundManager.playFanfare();
            const pts = 300;
            state.score += pts;
            setScore(state.score);
            if (onScoreUpdate) onScoreUpdate(state.score);

            state.warpTimeRemaining = 1.2;
            setWarpActive(true);

            academicStore.recordChoice({
              gameId: 'velocity-sonic-drift',
              concept: item.term,
              isCorrect: true,
              quickExplanation: item.explanation,
            });

            for (let i = 0; i < 16; i++) {
              const a = Math.random() * Math.PI * 2;
              const sp = 80 + Math.random() * 160;
              state.particles.push({
                x: itemX,
                y: playerY,
                vx: Math.cos(a) * sp,
                vy: Math.sin(a) * sp,
                size: 4 + Math.random() * 4,
                color: '#38bdf8',
                alpha: 1,
              });
            }
          }
        }
      }

      // Cleanup items
      state.items = state.items.filter((it) => it.y < height + 80);

      // Update particles
      for (const p of state.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha -= dt * 2.5;
      }
      state.particles = state.particles.filter((p) => p.alpha > 0);

      // ================= RENDER =================
      ctx.clearRect(0, 0, width, height);

      // Cyber Grid Track Background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // 3 Highway Lanes
      ctx.fillStyle = '#111827';
      ctx.fillRect(125, 0, 420, height);

      // Lane dividers
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 2;
      ctx.setLineDash([16, 16]);
      ctx.lineDashOffset = -time * 0.4;
      ctx.beginPath();
      ctx.moveTo(265, 0);
      ctx.lineTo(265, height);
      ctx.moveTo(405, 0);
      ctx.lineTo(405, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Speed lines
      ctx.strokeStyle = warpActive ? 'rgba(232, 121, 249, 0.4)' : 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.5;
      for (const line of state.speedLines) {
        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(line.x, line.y + line.len);
        ctx.stroke();
      }

      // Draw Track Items (Boost Gates vs Hazard Barriers)
      for (const it of state.items) {
        if (it.collected) continue;
        const ix = laneCoords[it.lane];
        const iy = it.y;

        ctx.save();
        if (it.isHazard) {
          // Hazard Barrier (Red/Orange)
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.roundRect(ix - 55, iy - 14, 110, 28, 8);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(it.term, ix, iy + 4);
        } else {
          // Concept Boost Gate (Cyan/Purple Neon Portal)
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 14;
          ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(ix - 55, iy - 16, 110, 32, 10);
          ctx.fill();
          ctx.stroke();

          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'black 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`⚡ ${it.term}`, ix, iy + 4);
        }
        ctx.restore();
      }

      // Draw Aerodynamic Player Craft
      const px = state.currentX;
      const py = playerY;

      ctx.save();
      ctx.shadowColor = warpActive ? '#e879f9' : '#06b6d4';
      ctx.shadowBlur = 16;

      // Thruster Flame
      ctx.fillStyle = warpActive ? '#e879f9' : '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(px - 10, py + 24);
      ctx.lineTo(px + 10, py + 24);
      ctx.lineTo(px, py + 38 + Math.sin(time * 0.05) * 6);
      ctx.closePath();
      ctx.fill();

      // Ship Fuselage
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(px, py - 26);
      ctx.lineTo(px + 20, py + 20);
      ctx.lineTo(px, py + 14);
      ctx.lineTo(px - 20, py + 20);
      ctx.closePath();
      ctx.fill();

      // Cockpit Glow
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(px, py - 4, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Draw Particles
      for (const p of state.particles) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [spawnRow, onGameOver, onScoreUpdate, warpActive]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-5xl aspect-[16/10] max-h-[82vh] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-slate-800 select-none"
    >
      {/* Top Contemporary HUD */}
      <div className="absolute top-3 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-white flex items-center gap-2 backdrop-blur-md">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-sm font-extrabold">{score.toLocaleString()}</span>
          </div>

          <div className="px-3 py-1.5 rounded-2xl bg-cyan-900/60 border border-cyan-500/50 text-cyan-300 text-xs font-black font-mono flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
            <span>{speedMph} MPH</span>
          </div>
        </div>

        {/* Shield Integrity */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-white">
          <Shield className="w-4 h-4 text-emerald-400" />
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i < shield ? 'bg-emerald-400 shadow-xs' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <canvas
        ref={canvasRef}
        width={670}
        height={560}
        className="w-full h-full object-contain"
      />

      {/* Mobile Steer Touch Pads */}
      <div className="absolute bottom-3 inset-x-4 z-20 flex items-center justify-between md:hidden">
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            steer(-1);
          }}
          className="p-4 rounded-2xl bg-slate-800/90 active:bg-cyan-600 text-white font-bold border border-slate-600 shadow-lg active:scale-95 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            steer(1);
          }}
          className="p-4 rounded-2xl bg-slate-800/90 active:bg-cyan-600 text-white font-bold border border-slate-600 shadow-lg active:scale-95 transition-all"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export const VelocitySonicDriftGame: GameDefinition = {
  id: 'velocity-sonic-drift',
  title: 'Velocity Sonic Drift',
  dimension: '2d',
  category: 'reflex',
  difficulty: 'medio',
  tagline: 'Acelerador supersónico 2D con verificación garantizada de vía libre',
  instruction: 'Conduce con [← / →] o [A / D]. Atraviesa los portales de conceptos válidos y esquiva las barreras distractoras.',
  article: {
    lore: 'En los túneles cuánticos de Vortex, la aceleración no tiene límite. Tu nave interceptora sobrevive recolectando postulados legítimos que estabilizan el núcleo de propulsión.',
    mechanics: 'Pista de 3 carriles con aceleración progresiva y comprobación algorítmica de solvencia (nunca encontrarás un muro bloqueado al 100%).',
    tips: [
      'Los portales de conceptos válidos otorgan impulso Warp y puntos dobles.',
      'Anticipa la trayectoria mirando 2 filas por delante de tu nave.',
      'Tienes 3 cargas de escudo antes de que el motor colapse.',
    ],
  },
  controlsDescription: {
    desktop: 'Flechas [← / →] o teclas [A / D] para cambiar de carril.',
    mobile: 'Botones táctiles de flecha izquierda y derecha en pantalla.',
  },
  icon: 'Zap',
  color: 'from-cyan-500 to-blue-600',
  accentColor: '#06b6d4',
  unlockedByDefault: true,
  unlockCost: 0,
  Component: VelocitySonicDriftView,
};
