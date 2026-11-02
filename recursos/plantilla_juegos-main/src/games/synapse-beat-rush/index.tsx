import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { type GameDefinition, type GameInstanceProps } from '../../types/game';
import { soundManager } from '../../services/soundManager';
import { academicStore } from '../../services/academicStore';
import { SolvabilityVerifier } from '../../services/solvabilityVerifier';
import { Trophy, CircleDot, Zap, Music, Flame, Sparkles, Volume2 } from 'lucide-react';

interface RhythmNote {
  id: string;
  lane: number; // 0, 1, 2, 3 (D, F, J, K)
  y: number; // Current Y position
  timeTarget: number;
  term?: string;
  isConceptNode?: boolean;
  isCorrect?: boolean;
  explanation?: string;
  hit: boolean;
  missed: boolean;
  color: string;
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

interface HitJudgement {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
}

export const SynapseBeatRushView: React.FC<GameInstanceProps> = ({
  onGameOver,
  isFrenzyMode = false,
  onScoreUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [marbles, setMarbles] = useState(0);
  const [feverActive, setFeverActive] = useState(false);
  const [activeTopic, setActiveTopic] = useState(() => academicStore.getActiveTopic());

  useEffect(() => {
    return academicStore.subscribe(() => {
      setActiveTopic(academicStore.getActiveTopic());
    });
  }, []);

  const stateRef = useRef({
    score: 0,
    combo: 0,
    maxCombo: 0,
    marbles: 0,
    health: 100,
    notes: [] as RhythmNote[],
    particles: [] as Particle[],
    judgements: [] as HitJudgement[],
    lanePressed: [false, false, false, false],
    lastSpawnTime: 0,
    gameOver: false,
    speed: 360, // pixels per second
    bpm: 128,
  });

  // Solvability-verified beat generator
  const spawnNote = useCallback((time: number) => {
    const lane = Math.floor(Math.random() * 4);
    const pool = academicStore.getRandomItemPool(4);
    const isConcept = Math.random() > 0.45;
    const item = pool[Math.floor(Math.random() * pool.length)] || {
      term: activeTopic.correctItems[0]?.term || 'Pulso',
      isCorrect: true,
      explanation: 'Pulso de resonancia rítmica.',
    };

    const newNote: RhythmNote = {
      id: `n-${Date.now()}-${Math.random()}`,
      lane,
      y: -30,
      timeTarget: time + 1400,
      term: isConcept ? item.term : undefined,
      isConceptNode: isConcept,
      isCorrect: item.isCorrect,
      explanation: item.explanation,
      hit: false,
      missed: false,
      color: ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b'][lane],
    };

    // Apply rhythm anti-clipping solvability verification
    const candidates = [...stateRef.current.notes, newNote];
    const verified = SolvabilityVerifier.verifyRhythmSequence(
      candidates.map((n) => ({ ...n, timeMs: n.timeTarget })),
      200
    );

    if (verified.some((v) => v.id === newNote.id)) {
      stateRef.current.notes.push(newNote);
    }
  }, [activeTopic]);

  // Handle hit on a specific lane (0 to 3)
  const triggerLaneHit = useCallback((laneIndex: number) => {
    const state = stateRef.current;
    if (state.gameOver) return;

    state.lanePressed[laneIndex] = true;
    setTimeout(() => {
      state.lanePressed[laneIndex] = false;
    }, 120);

    const hitY = 460; // Strike line
    const hitThreshold = 65;

    // Find closest unhit note in this lane
    const candidates = state.notes.filter(
      (n) => n.lane === laneIndex && !n.hit && !n.missed && Math.abs(n.y - hitY) < hitThreshold
    );

    if (candidates.length > 0) {
      candidates.sort((a, b) => Math.abs(a.y - hitY) - Math.abs(b.y - hitY));
      const target = candidates[0];
      target.hit = true;

      const dist = Math.abs(target.y - hitY);
      let grade = 'GOOD';
      let pts = 50;
      let color = '#38bdf8';

      if (dist < 18) {
        grade = 'PERFECT!';
        pts = 300;
        color = '#a855f7';
        soundManager.playFanfare();
      } else if (dist < 38) {
        grade = 'GREAT!';
        pts = 150;
        color = '#10b981';
        soundManager.playClick('E5');
      } else {
        soundManager.playClick('C5');
      }

      // If concept note, evaluate academic verification
      if (target.isConceptNode && target.term) {
        academicStore.recordChoice({
          gameId: 'synapse-beat-rush',
          concept: target.term,
          isCorrect: target.isCorrect ?? true,
          quickExplanation: target.explanation || 'Resonancia rítmica validada.',
        });
        if (target.isCorrect) {
          pts += 200;
        }
      }

      state.combo += 1;
      if (state.combo > state.maxCombo) state.maxCombo = state.combo;

      const multiplier = state.combo >= 20 ? 4 : state.combo >= 10 ? 3 : state.combo >= 5 ? 2 : 1;
      const finalPts = pts * multiplier;
      state.score += finalPts;
      setScore(state.score);
      setCombo(state.combo);
      setMaxCombo(state.maxCombo);
      if (onScoreUpdate) onScoreUpdate(state.score);

      // Trigger burst particles
      const laneX = 140 + laneIndex * 130;
      for (let i = 0; i < 18; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 60 + Math.random() * 180;
        state.particles.push({
          x: laneX,
          y: hitY,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          size: 3 + Math.random() * 4,
          color,
          alpha: 1,
        });
      }

      state.judgements.push({
        x: laneX,
        y: hitY - 30,
        text: grade,
        color,
        alpha: 1,
      });

      if (state.combo >= 25 && !feverActive) {
        setFeverActive(true);
      }
    } else {
      // Miss penalty
      state.combo = 0;
      setCombo(0);
      soundManager.playHit();
    }
  }, [feverActive, onScoreUpdate]);

  // Keyboard controls [D, F, J, K]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        triggerLaneHit(0);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        triggerLaneHit(1);
      } else if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        triggerLaneHit(2);
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        triggerLaneHit(3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerLaneHit]);

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

      // Spawn notes periodically
      if (time - state.lastSpawnTime > 450) {
        spawnNote(time);
        state.lastSpawnTime = time;
      }

      // Update notes
      for (const note of state.notes) {
        if (!note.hit && !note.missed) {
          note.y += state.speed * dt;
          if (note.y > 510) {
            note.missed = true;
            state.combo = 0;
            setCombo(0);
            state.health = Math.max(0, state.health - 8);
            if (state.health <= 0 && !state.gameOver) {
              state.gameOver = true;
              onGameOver({
                score: state.score,
                marblesEarned: Math.floor(state.score / 250),
                won: false,
                stats: {
                  'Puntaje Final': state.score,
                  'Max Combo': state.maxCombo,
                  'Modo': 'Synapse Beat Rush',
                },
              });
            }
          }
        }
      }

      // Clean offscreen notes
      state.notes = state.notes.filter((n) => n.y < 560);

      // Update particles
      for (const p of state.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha -= dt * 2.2;
      }
      state.particles = state.particles.filter((p) => p.alpha > 0);

      // Update judgements
      for (const j of state.judgements) {
        j.y -= 35 * dt;
        j.alpha -= dt * 1.8;
      }
      state.judgements = state.judgements.filter((j) => j.alpha > 0);

      // ================= RENDER =================
      ctx.clearRect(0, 0, width, height);

      // Background Cyber Highway
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 4 Neon Lanes (Width: 130 each, starting at X=75)
      const laneStartX = 75;
      const laneWidth = 130;
      const strikeY = 460;

      for (let l = 0; l < 4; l++) {
        const lx = laneStartX + l * laneWidth;
        const isPressed = state.lanePressed[l];

        // Lane Column glow
        ctx.fillStyle = isPressed ? 'rgba(147, 51, 234, 0.18)' : 'rgba(30, 41, 59, 0.5)';
        ctx.fillRect(lx, 0, laneWidth, height);

        // Lane separator line
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, height);
        ctx.stroke();

        // Key prompt at bottom
        ctx.fillStyle = isPressed ? '#c084fc' : '#94a3b8';
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(['D', 'F', 'J', 'K'][l], lx + laneWidth / 2, 520);
      }
      // Right edge
      ctx.strokeRect(laneStartX, 0, laneWidth * 4, height);

      // Strike Line
      ctx.strokeStyle = feverActive ? '#e879f9' : '#38bdf8';
      ctx.lineWidth = 4;
      ctx.shadowColor = feverActive ? '#e879f9' : '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(laneStartX, strikeY);
      ctx.lineTo(laneStartX + laneWidth * 4, strikeY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Notes
      for (const note of state.notes) {
        if (note.hit || note.missed) continue;
        const nx = laneStartX + note.lane * laneWidth + laneWidth / 2;
        const ny = note.y;

        ctx.save();
        ctx.shadowColor = note.color;
        ctx.shadowBlur = 10;

        if (note.isConceptNode) {
          // Concept Pulse Orb with Term Badge
          ctx.fillStyle = note.color;
          ctx.beginPath();
          ctx.arc(nx, ny, 20, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Term pill
          if (note.term) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.font = 'bold 11px sans-serif';
            const tm = ctx.measureText(note.term).width;
            ctx.beginPath();
            ctx.roundRect(nx - tm / 2 - 8, ny - 34, tm + 16, 20, 6);
            ctx.fill();
            ctx.strokeStyle = note.color;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(note.term, nx, ny - 20);
          }
        } else {
          // Standard rhythmic bar
          ctx.fillStyle = note.color;
          ctx.beginPath();
          ctx.roundRect(nx - 42, ny - 10, 84, 20, 8);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(nx, ny, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

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

      // Draw Judgement Text
      for (const j of state.judgements) {
        ctx.save();
        ctx.globalAlpha = j.alpha;
        ctx.fillStyle = j.color;
        ctx.font = 'black 22px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(j.text, j.x, j.y);
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [spawnNote, onGameOver, feverActive]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-5xl aspect-[16/10] max-h-[82vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-slate-700 select-none"
    >
      {/* Top Contemporary HUD */}
      <div className="absolute top-3 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-700 text-white flex items-center gap-2 backdrop-blur-md">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-sm font-extrabold">{score.toLocaleString()}</span>
          </div>

          <div className="px-3 py-1.5 rounded-2xl bg-purple-900/60 border border-purple-500/50 text-purple-300 text-xs font-black font-mono">
            COMBO: {combo}x
          </div>
        </div>

        {/* Academic Topic Prompt */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-600 text-[11px] text-slate-300 font-bold max-w-xs truncate">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="truncate">{activeTopic.shortCriteria}</span>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <canvas
        ref={canvasRef}
        width={670}
        height={560}
        className="w-full h-full object-contain"
      />

      {/* Bottom Mobile / Touch Lane Triggers */}
      <div className="absolute bottom-2 inset-x-4 z-20 grid grid-cols-4 gap-2 md:hidden">
        {['D', 'F', 'J', 'K'].map((k, i) => (
          <button
            key={k}
            onPointerDown={(e) => {
              e.preventDefault();
              triggerLaneHit(i);
            }}
            className="py-3 rounded-2xl bg-slate-800/90 active:bg-purple-600 text-white font-mono font-black text-lg border border-slate-600 shadow-md transition-all active:scale-95"
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
};

export const SynapseBeatRushGame: GameDefinition = {
  id: 'synapse-beat-rush',
  title: 'Synapse Beat Rush',
  dimension: '2d',
  category: 'rhythm',
  difficulty: 'medio',
  tagline: 'Autopista rítmica y verificación socrática al compás del beat',
  instruction: 'Presiona [D, F, J, K] cuando las notas y conceptos alcancen la línea de impacto.',
  article: {
    lore: 'En la red sináptica de Vortex, el conocimiento vibra a frecuencias armónicas exactas. Sincroniza tus pulsos cerebrales para alcanzar la cumbre auditiva.',
    mechanics: 'Carretera rítmica de 4 carriles con nodos de conceptos académicos. Golpea en el momento exacto para encadenar combos y activar el modo Fever.',
    tips: [
      'Mantén la vista en la parte media de la pista para anticipar los cambios de carril.',
      'Los pulsos dorados con conceptos comprobados otorgan bonificación doble de puntos.',
      'En dispositivos móviles puedes pulsar directamente sobre los botones inferiores.',
    ],
  },
  controlsDescription: {
    desktop: 'Teclas [D, F, J, K] al llegar a la línea de impacto.',
    mobile: 'Toca los 4 paneles táctiles inferiores al ritmo.',
  },
  icon: 'Music',
  color: 'from-purple-600 to-indigo-700',
  accentColor: '#9333ea',
  unlockedByDefault: true,
  unlockCost: 0,
  Component: SynapseBeatRushView,
};
