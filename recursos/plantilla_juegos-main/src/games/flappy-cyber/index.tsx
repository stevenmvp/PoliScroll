import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { type GameDefinition, type GameInstanceProps } from '../../types/game';
import { soundManager } from '../../services/soundManager';
import { academicStore } from '../../services/academicStore';
import { themeStore } from '../../services/themeStore';
import { Trophy, CircleDot, Play, Sparkles, GraduationCap } from 'lucide-react';

interface AcademicGate {
  x: number;
  topGapY: number; // e.g. 135
  bottomGapY: number; // e.g. 325
  gapHeight: number; // e.g. 95
  topOption: { term: string; isCorrect: boolean; explanation: string; mistakenOrigin?: string };
  bottomOption: { term: string; isCorrect: boolean; explanation: string; mistakenOrigin?: string };
  passed: boolean;
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

interface FloatingScore {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
}

export const FlappyCyberView: React.FC<GameInstanceProps> = ({
  onGameOver,
  onScoreUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [score, setScore] = useState(0);
  const [marbles, setMarbles] = useState(0);
  const [activeTopic, setActiveTopic] = useState(() => academicStore.getActiveTopic());

  useEffect(() => {
    return academicStore.subscribe(() => {
      setActiveTopic(academicStore.getActiveTopic());
    });
  }, []);

  const createGate = useCallback((x: number): AcademicGate => {
    const pool = academicStore.getRandomItemPool(4);
    const correct = pool.find((i) => i.isCorrect) || {
      term: activeTopic.correctItems[0]?.term || 'Correcto',
      isCorrect: true,
      explanation: activeTopic.correctItems[0]?.explanation || '',
    };
    const distractor = pool.find((i) => !i.isCorrect) || {
      term: activeTopic.distractorItems[0]?.term || 'Distractor',
      isCorrect: false,
      explanation: activeTopic.distractorItems[0]?.explanation || '',
      mistakenOrigin: activeTopic.distractorItems[0]?.mistakenOrigin,
    };

    const isTopCorrect = Math.random() > 0.5;
    return {
      x,
      topGapY: 135,
      bottomGapY: 325,
      gapHeight: 95,
      topOption: isTopCorrect ? correct : distractor,
      bottomOption: isTopCorrect ? distractor : correct,
      passed: false,
    };
  }, [activeTopic]);

  const stateRef = useRef({
    birdY: 220,
    velocity: 0,
    gravity: 660,
    jumpForce: -260,
    flapWingTime: 0,
    score: 0,
    marbles: 0,
    gates: [] as AcademicGate[],
    particles: [] as Particle[],
    floatingScores: [] as FloatingScore[],
    gameOver: false,
  });

  useEffect(() => {
    stateRef.current.gates = [createGate(520), createGate(860)];
  }, [createGate]);

  const triggerBurst = (x: number, y: number, color = '#06b6d4', count = 16) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 90;
      stateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 3.5,
        color,
        alpha: 1.0,
      });
    }
  };

  const addScoreText = (x: number, y: number, text: string, color = '#06b6d4') => {
    stateRef.current.floatingScores.push({ x, y, text, color, alpha: 1.0 });
  };

  const flap = useCallback(() => {
    if (stateRef.current.gameOver) return;
    stateRef.current.velocity = stateRef.current.jumpForce;
    stateRef.current.flapWingTime = 0.3;
    soundManager.playJump();

    // Thruster smoke particles behind bird
    for (let i = 0; i < 5; i++) {
      stateRef.current.particles.push({
        x: 100,
        y: stateRef.current.birdY + (Math.random() - 0.5) * 8,
        vx: -80 - Math.random() * 50,
        vy: (Math.random() - 0.5) * 40,
        size: 3.5,
        color: '#f59e0b',
        alpha: 0.9,
      });
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isAction = [' ', 'ArrowUp', 'w', 'W'].includes(e.key) || ['Space', 'ArrowUp', 'KeyW'].includes(e.code);
      if (isAction) {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    const w = 780;
    const h = 480;
    const birdX = 110;
    const birdRadius = 14;

    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    ctx.scale(dpr, dpr);

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const s = stateRef.current;
      const biome = themeStore.getBiome();
      if (s.gameOver) return;

      // Bird Physics
      s.velocity += s.gravity * delta;
      s.birdY += s.velocity * delta;
      if (s.flapWingTime > 0) s.flapWingTime -= delta;

      // Ceiling and floor bounds
      if (s.birdY - birdRadius < 10 || s.birdY + birdRadius > h - 25) {
        s.gameOver = true;
        soundManager.playHit();
        onGameOver({ score: s.score, marblesEarned: s.marbles, won: false });
        return;
      }

      // Move Academic Gates
      const pipeSpeed = 160;
      s.gates.forEach((gate) => {
        gate.x -= pipeSpeed * delta;

        // Collision detection with gate
        const pipeWidth = 70;
        const inXRange = birdX + birdRadius > gate.x && birdX - birdRadius < gate.x + pipeWidth;

        if (inXRange) {
          const inTopGap =
            s.birdY - birdRadius > gate.topGapY - gate.gapHeight / 2 &&
            s.birdY + birdRadius < gate.topGapY + gate.gapHeight / 2;
          const inBottomGap =
            s.birdY - birdRadius > gate.bottomGapY - gate.gapHeight / 2 &&
            s.birdY + birdRadius < gate.bottomGapY + gate.gapHeight / 2;

          if (inTopGap) {
            if (!gate.passed) {
              gate.passed = true;
              if (gate.topOption.isCorrect) {
                s.score += 200;
                s.marbles += 2;
                soundManager.playCorrect();
                soundManager.playMarbleCollect(2);
                triggerBurst(gate.x, gate.topGapY, '#10b981', 20);
                addScoreText(gate.x + 30, gate.topGapY - 40, '+200 ¡ACIERTO!', '#10b981');
                academicStore.recordChoice({
                  gameId: 'flappy-cyber',
                  concept: gate.topOption.term,
                  isCorrect: true,
                  quickExplanation: gate.topOption.explanation,
                });
                setScore(s.score);
                setMarbles(s.marbles);
                if (onScoreUpdate) onScoreUpdate(s.score);
              } else {
                s.gameOver = true;
                soundManager.playHit();
                academicStore.recordChoice({
                  gameId: 'flappy-cyber',
                  concept: gate.topOption.term,
                  isCorrect: false,
                  mistakenOrigin: gate.topOption.mistakenOrigin,
                  quickExplanation: gate.topOption.explanation,
                });
                onGameOver({ score: s.score, marblesEarned: s.marbles, won: false });
                return;
              }
            }
          } else if (inBottomGap) {
            if (!gate.passed) {
              gate.passed = true;
              if (gate.bottomOption.isCorrect) {
                s.score += 200;
                s.marbles += 2;
                soundManager.playCorrect();
                soundManager.playMarbleCollect(2);
                triggerBurst(gate.x, gate.bottomGapY, '#10b981', 20);
                addScoreText(gate.x + 30, gate.bottomGapY - 40, '+200 ¡ACIERTO!', '#10b981');
                academicStore.recordChoice({
                  gameId: 'flappy-cyber',
                  concept: gate.bottomOption.term,
                  isCorrect: true,
                  quickExplanation: gate.bottomOption.explanation,
                });
                setScore(s.score);
                setMarbles(s.marbles);
                if (onScoreUpdate) onScoreUpdate(s.score);
              } else {
                s.gameOver = true;
                soundManager.playHit();
                academicStore.recordChoice({
                  gameId: 'flappy-cyber',
                  concept: gate.bottomOption.term,
                  isCorrect: false,
                  mistakenOrigin: gate.bottomOption.mistakenOrigin,
                  quickExplanation: gate.bottomOption.explanation,
                });
                onGameOver({ score: s.score, marblesEarned: s.marbles, won: false });
                return;
              }
            }
          } else {
            // Crashed into solid pipe tower
            s.gameOver = true;
            soundManager.playHit();
            onGameOver({ score: s.score, marblesEarned: s.marbles, won: false });
            return;
          }
        }
      });

      // Recycle gates across wide canvas
      if (s.gates.length > 0 && s.gates[0].x < -100) {
        s.gates.shift();
        s.gates.push(createGate(s.gates[s.gates.length - 1].x + 340));
      }

      // Update Particles
      s.particles.forEach((p) => {
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.alpha -= delta * 1.5;
      });
      s.particles = s.particles.filter((p) => p.alpha > 0);

      // Update Floating Scores
      s.floatingScores.forEach((f) => {
        f.y -= delta * 40;
        f.alpha -= delta * 1.1;
      });
      s.floatingScores = s.floatingScores.filter((f) => f.alpha > 0);

      // ==================== RENDERING ====================
      ctx.clearRect(0, 0, w, h);

      // 1. Scenic Atmospheric Biome Sky
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      if (biome.id === 'snow') {
        sky.addColorStop(0, '#bae6fd');
        sky.addColorStop(0.65, '#e0f2fe');
        sky.addColorStop(1, '#f8fafc');
      } else if (biome.id === 'desert') {
        sky.addColorStop(0, '#fef3c7');
        sky.addColorStop(0.6, '#fed7aa');
        sky.addColorStop(1, '#fff7ed');
      } else if (biome.id === 'jungle') {
        sky.addColorStop(0, '#bbf7d0');
        sky.addColorStop(0.6, '#dcfce7');
        sky.addColorStop(1, '#f0fdf4');
      } else {
        sky.addColorStop(0, '#e0e7ff');
        sky.addColorStop(0.5, '#f1f5f9');
        sky.addColorStop(1, '#ffffff');
      }
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Distant Parallax Skyline / Mountains
      ctx.save();
      ctx.fillStyle = biome.accentColor;
      ctx.globalAlpha = 0.22;
      ctx.beginPath();
      ctx.moveTo(0, h - 25);
      ctx.lineTo(0, h - 160);
      ctx.lineTo(160, h - 220);
      ctx.lineTo(340, h - 140);
      ctx.lineTo(540, h - 240);
      ctx.lineTo(700, h - 170);
      ctx.lineTo(w, h - 200);
      ctx.lineTo(w, h - 25);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 2. Render Academic Gate Towers with 2 Openings
      s.gates.forEach((gate) => {
        const pipeW = 70;
        const halfGap = gate.gapHeight / 2;

        // Metallic Pillar Gradient
        const towerGrad = ctx.createLinearGradient(gate.x, 0, gate.x + pipeW, 0);
        towerGrad.addColorStop(0, '#1e293b');
        towerGrad.addColorStop(0.3, '#334155');
        towerGrad.addColorStop(0.7, '#475569');
        towerGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = towerGrad;

        // Top Tower Segment
        ctx.fillRect(gate.x, 0, pipeW, gate.topGapY - halfGap);

        // Mid Tower Segment (Between gaps)
        const midTop = gate.topGapY + halfGap;
        const midBottom = gate.bottomGapY - halfGap;
        ctx.fillRect(gate.x, midTop, pipeW, midBottom - midTop);

        // Bottom Tower Segment
        ctx.fillRect(gate.x, gate.bottomGapY + halfGap, pipeW, h - (gate.bottomGapY + halfGap) - 25);

        // High-Tech Beveled Caps
        ctx.fillStyle = '#64748b';
        ctx.fillRect(gate.x - 3, gate.topGapY - halfGap - 6, pipeW + 6, 8);
        ctx.fillRect(gate.x - 3, midTop, pipeW + 6, 8);
        ctx.fillRect(gate.x - 3, midBottom - 8, pipeW + 6, 8);
        ctx.fillRect(gate.x - 3, gate.bottomGapY + halfGap, pipeW + 6, 8);

        // Concept Plaques inside gaps
        // Top Gap Plaque
        ctx.save();
        ctx.shadowColor = 'rgba(15, 23, 42, 0.15)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(gate.x - 45, gate.topGapY - 18, pipeW + 90, 36, 8);
        ctx.fill();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        const topTerm = gate.topOption.term.length > 20 ? gate.topOption.term.slice(0, 18) + '...' : gate.topOption.term;
        ctx.fillText(topTerm, gate.x + pipeW / 2, gate.topGapY + 5);
        ctx.restore();

        // Bottom Gap Plaque
        ctx.save();
        ctx.shadowColor = 'rgba(15, 23, 42, 0.15)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(gate.x - 45, gate.bottomGapY - 18, pipeW + 90, 36, 8);
        ctx.fill();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        const btmTerm = gate.bottomOption.term.length > 20 ? gate.bottomOption.term.slice(0, 18) + '...' : gate.bottomOption.term;
        ctx.fillText(btmTerm, gate.x + pipeW / 2, gate.bottomGapY + 5);
        ctx.restore();
      });

      // Ground Trim
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, h - 25, w, 25);
      ctx.fillStyle = biome.accentColor;
      ctx.fillRect(0, h - 27, w, 3);

      // 3. Render Sleek Avian Drone / Bird
      ctx.save();
      ctx.translate(birdX, s.birdY);
      const angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (s.velocity / 320) * 0.8));
      ctx.rotate(angle);

      // Wing flap animation
      const wingAngle = s.flapWingTime > 0 ? -0.4 : 0.2;

      // Streamlined Avian Body
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wing
      ctx.save();
      ctx.rotate(wingAngle);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.ellipse(-4, 0, 12, 7, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Cockpit / Eye Visor
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(8, -4, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(10, -4, 2, 0, Math.PI * 2);
      ctx.fill();

      // Golden Beak
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(14, -2);
      ctx.lineTo(24, 2);
      ctx.lineTo(14, 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Particles
      s.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Floating Scores
      s.floatingScores.forEach((f) => {
        ctx.save();
        ctx.globalAlpha = f.alpha;
        ctx.fillStyle = f.color;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 6;
        ctx.fillText(f.text, f.x, f.y);
        ctx.restore();
      });
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [createGate, onGameOver, onScoreUpdate]);

  return (
    <div
      ref={containerRef}
      onClick={flap}
      className="relative w-full h-full flex flex-col items-center justify-between p-2 select-none cursor-pointer"
    >
      {/* Unified Stage Canvas: Fills 100% of the stage */}
      <div className="relative w-full flex-1 rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-900">
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>

      {/* Tactile Flap Action Bar */}
      <div className="w-full max-w-lg mt-2 shrink-0">
        <button
          onClick={flap}
          className="w-full py-3 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Toca o Presiona Espacio para Aletear hacia la Compuerta Correcta</span>
        </button>
      </div>
    </div>
  );
};

export const FlappyCyberGame: GameDefinition = {
  id: 'flappy-cyber',
  title: 'Flappy Wings Academy',
  tagline: 'Vuela entre compuertas y atraviesa la apertura con la respuesta válida',
  category: 'reflex',
  dimension: '2d',
  difficulty: 'medio',
  icon: 'Compass',
  color: '#06b6d4',
  accentColor: '#38bdf8',
  unlockedByDefault: true,
  unlockCost: 0,
  instruction: 'Aletea para ajustar tu altura y atraviesa la compuerta superior o inferior que contenga el término correcto.',
  controlsDescription: {
    desktop: 'Espacio / Click / Flecha Arriba para aletear',
    mobile: 'Tocar pantalla para aletear',
  },
  article: {
    lore: 'Navega en los túneles aerodinámicos de la academia evitando campos de fuerza distractorios.',
    mechanics: 'Cada tubería ofrece dos aperturas rotuladas: una correcta y otra distractora. Ajusta tu cadencia de aleteo.',
    tips: ['Lee la pregunta en el encabezado para anticipar si debes pasar por arriba o por abajo', 'Mantén una cadencia rítmica'],
  },
  Component: FlappyCyberView,
};
