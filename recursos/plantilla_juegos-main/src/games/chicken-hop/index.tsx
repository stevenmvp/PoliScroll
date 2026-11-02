import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { type GameDefinition, type GameInstanceProps } from '../../types/game';
import { soundManager } from '../../services/soundManager';
import { academicStore } from '../../services/academicStore';
import { themeStore } from '../../services/themeStore';
import { Trophy, CircleDot, Zap, Sparkles, Play } from 'lucide-react';

interface SteppingStone {
  x: number;
  width: number;
  term: string;
  isCorrect: boolean;
  explanation: string;
  mistakenOrigin?: string;
  crumbled?: boolean;
  shatterPieces?: Array<{ x: number; y: number; vx: number; vy: number; w: number; h: number }>;
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

interface Shockwave {
  x: number;
  y: number;
  r: number;
  maxR: number;
  alpha: number;
}

interface FloatingScore {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
}

export const ChickenHopView: React.FC<GameInstanceProps> = ({
  onGameOver,
  isFrenzyMode = false,
  onScoreUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [score, setScore] = useState(0);
  const [marbles, setMarbles] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [chargeVisual, setChargeVisual] = useState(0);
  const [activeTopic, setActiveTopic] = useState(() => academicStore.getActiveTopic());

  useEffect(() => {
    return academicStore.subscribe(() => {
      setActiveTopic(academicStore.getActiveTopic());
    });
  }, []);

  const generateStones = useCallback((): SteppingStone[] => {
    const pool = academicStore.getRandomItemPool(4);
    const correctItem = pool.find((i) => i.isCorrect) || {
      term: activeTopic.correctItems[0]?.term || 'Correcto',
      isCorrect: true,
      explanation: activeTopic.correctItems[0]?.explanation || '',
    };
    const distractors = pool.filter((i) => !i.isCorrect);
    const distractor1 = distractors[0] || {
      term: activeTopic.distractorItems[0]?.term || 'Distractor 1',
      isCorrect: false,
      explanation: activeTopic.distractorItems[0]?.explanation || '',
      mistakenOrigin: activeTopic.distractorItems[0]?.mistakenOrigin,
    };
    const distractor2 = distractors[1] || {
      term: activeTopic.distractorItems[1]?.term || 'Distractor 2',
      isCorrect: false,
      explanation: activeTopic.distractorItems[1]?.explanation || '',
      mistakenOrigin: activeTopic.distractorItems[1]?.mistakenOrigin,
    };

    // 3 Generously Spaced Island Stones across 780px canvas
    const slots = [
      { x: 210, width: 85 },
      { x: 400, width: 85 },
      { x: 590, width: 85 },
    ];

    const correctSlotIdx = Math.floor(Math.random() * 3);
    const distractorPool = [distractor1, distractor2];
    let dIdx = 0;

    return slots.map((slot, idx) => {
      if (idx === correctSlotIdx) {
        return {
          ...slot,
          term: correctItem.term,
          isCorrect: true,
          explanation: correctItem.explanation,
        };
      } else {
        const d = distractorPool[dIdx++] || distractor1;
        return {
          ...slot,
          term: d.term,
          isCorrect: false,
          explanation: d.explanation,
          mistakenOrigin: d.mistakenOrigin,
        };
      }
    });
  }, [activeTopic]);

  const stateRef = useRef({
    score: 0,
    marbles: 0,
    phase: 'idle' as 'idle' | 'charging' | 'jumping' | 'landed' | 'falling' | 'gameover',
    chargePower: 0,
    chicken: {
      x: 75,
      y: 345,
      vx: 0,
      vy: 0,
      scaleX: 1.0,
      scaleY: 1.0,
      angle: 0,
      flapTime: 0,
    },
    startPlatformWidth: 105,
    stones: [] as SteppingStone[],
    particles: [] as Particle[],
    shockwaves: [] as Shockwave[],
    floatingScores: [] as FloatingScore[],
    gameOver: false,
  });

  useEffect(() => {
    stateRef.current.stones = generateStones();
  }, [generateStones]);

  const triggerDust = (x: number, y: number, color = '#fef08a', count = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 80;
      stateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color,
        alpha: 1.0,
      });
    }
  };

  const addScoreText = (x: number, y: number, text: string, color = '#10b981') => {
    stateRef.current.floatingScores.push({ x, y, text, color, alpha: 1.0 });
  };

  const handleStartCharge = () => {
    if (stateRef.current.phase !== 'idle') return;
    stateRef.current.phase = 'charging';
    stateRef.current.chargePower = 0;
    setIsPressing(true);
    soundManager.playClick('C3');
  };

  const handleRelease = useCallback(() => {
    if (stateRef.current.phase !== 'charging') return;
    stateRef.current.phase = 'jumping';
    setIsPressing(false);
    setChargeVisual(0);

    const power = stateRef.current.chargePower;
    stateRef.current.chicken.vx = 140 + power * 5.2;
    stateRef.current.chicken.vy = -(210 + power * 4.6);
    stateRef.current.chicken.scaleX = 0.8;
    stateRef.current.chicken.scaleY = 1.35;
    soundManager.playJump();

    // Launch shockwave & feather dust
    stateRef.current.shockwaves.push({
      x: stateRef.current.chicken.x,
      y: 355,
      r: 8,
      maxR: 50,
      alpha: 0.9,
    });
    triggerDust(stateRef.current.chicken.x, 355, '#fde047', 16);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isAction = [' ', 'ArrowUp', 'Enter'].includes(e.key) || ['Space', 'ArrowUp', 'Enter'].includes(e.code);
      if (isAction) {
        e.preventDefault();
        if (stateRef.current.phase === 'idle') handleStartCharge();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const isAction = [' ', 'ArrowUp', 'Enter'].includes(e.key) || ['Space', 'ArrowUp', 'Enter'].includes(e.code);
      if (isAction) {
        e.preventDefault();
        handleRelease();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleRelease]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    const w = 780;
    const h = 480;
    const groundY = 360;

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

      // State Machine
      if (s.phase === 'charging') {
        s.chargePower += delta * 115;
        if (s.chargePower > 100) s.chargePower = 100;
        setChargeVisual(s.chargePower);

        // Tactile squash & vibration jitter
        s.chicken.scaleX = 1.0 + (s.chargePower / 100) * 0.4;
        s.chicken.scaleY = Math.max(0.65, 1.0 - (s.chargePower / 100) * 0.35);

        // Emit charge ripples
        if (Math.random() < 0.25) {
          s.shockwaves.push({
            x: s.chicken.x,
            y: groundY - 4,
            r: 6,
            maxR: 35,
            alpha: 0.7,
          });
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate?.(8);
          }
        }
      } else if (s.phase === 'jumping') {
        s.chicken.x += s.chicken.vx * delta;
        s.chicken.y += s.chicken.vy * delta;
        s.chicken.vy += 480 * delta; // Gravity

        s.chicken.flapTime += delta * 15;
        s.chicken.angle = Math.atan2(s.chicken.vy, s.chicken.vx) * 0.4;

        // Check landing on stones or ground
        if (s.chicken.y >= groundY - 15 && s.chicken.vy > 0) {
          // Check collision with stepping stones
          const hitStone = s.stones.find(
            (st) => s.chicken.x >= st.x && s.chicken.x <= st.x + st.width
          );

          if (hitStone) {
            s.chicken.y = groundY - 15;
            s.chicken.vy = 0;
            s.chicken.vx = 0;
            s.chicken.angle = 0;
            s.chicken.scaleX = 1.25;
            s.chicken.scaleY = 0.8;

            if (hitStone.isCorrect) {
              // Valid academic concept!
              s.phase = 'landed';
              s.score += 200;
              s.marbles += 3;
              soundManager.playCorrect();

              academicStore.recordChoice({
                gameId: 'chicken-hop',
                concept: hitStone.term,
                isCorrect: true,
                quickExplanation: hitStone.explanation,
              });

              addScoreText(hitStone.x + hitStone.width / 2, groundY - 50, '+200 ¡CORRECTO!', '#10b981');
              triggerDust(s.chicken.x, groundY - 10, '#34d399', 24);
              confetti({ particleCount: 30, spread: 60, origin: { x: s.chicken.x / w, y: 0.65 } });

              setScore(s.score);
              setMarbles(s.marbles);
              if (onScoreUpdate) onScoreUpdate(s.score);

              setTimeout(() => {
                s.phase = 'idle';
                s.chicken.x = 75;
                s.chicken.y = 345;
                s.chicken.scaleX = 1.0;
                s.chicken.scaleY = 1.0;
                s.stones = generateStones();
              }, 1200);
            } else {
              // Distractor! Stone crumbles
              hitStone.crumbled = true;
              hitStone.shatterPieces = [];
              for (let i = 0; i < 16; i++) {
                hitStone.shatterPieces.push({
                  x: hitStone.x + Math.random() * hitStone.width,
                  y: groundY + Math.random() * 40,
                  vx: (Math.random() - 0.5) * 150,
                  vy: -50 - Math.random() * 100,
                  w: 8 + Math.random() * 10,
                  h: 8 + Math.random() * 10,
                });
              }

              s.phase = 'falling';
              soundManager.playLoss();
              academicStore.recordChoice({
                gameId: 'chicken-hop',
                concept: hitStone.term,
                isCorrect: false,
                mistakenOrigin: hitStone.mistakenOrigin,
                quickExplanation: hitStone.explanation,
              });
            }
          } else {
            // Fell into canyon
            s.phase = 'falling';
            soundManager.playLoss();
          }
        }
      } else if (s.phase === 'falling') {
        s.chicken.y += delta * 420;
        s.chicken.angle += delta * 4;
        if (s.chicken.y > h + 50 && !s.gameOver) {
          s.gameOver = true;
          onGameOver({
            score: s.score,
            marblesEarned: s.marbles,
            won: false,
            stats: {
              'Puntaje Final': s.score,
              'Canicas Ganadas': s.marbles,
            },
          });
        }
      }

      // Update shockwaves
      for (let i = s.shockwaves.length - 1; i >= 0; i--) {
        const sw = s.shockwaves[i];
        sw.r += delta * 80;
        sw.alpha -= delta * 1.8;
        if (sw.alpha <= 0) s.shockwaves.splice(i, 1);
      }

      // Update particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.alpha -= delta * 1.5;
        if (p.alpha <= 0) s.particles.splice(i, 1);
      }

      // Update floating scores
      for (let i = s.floatingScores.length - 1; i >= 0; i--) {
        const fs = s.floatingScores[i];
        fs.y -= delta * 30;
        fs.alpha -= delta * 1.2;
        if (fs.alpha <= 0) s.floatingScores.splice(i, 1);
      }

      // ==================== RENDER SCENE ====================
      ctx.clearRect(0, 0, w, h);

      // Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, biome.skyGradient[0]);
      skyGrad.addColorStop(1, biome.skyGradient[1]);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, groundY);

      // Canyon Abyss
      const abyssGrad = ctx.createLinearGradient(0, groundY, 0, h);
      abyssGrad.addColorStop(0, 'rgba(15, 23, 42, 0.85)');
      abyssGrad.addColorStop(1, '#020617');
      ctx.fillStyle = abyssGrad;
      ctx.fillRect(0, groundY, w, h - groundY);

      // Start Platform
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, groundY, s.startPlatformWidth, h - groundY);
      ctx.fillStyle = biome.accentColor;
      ctx.fillRect(0, groundY - 4, s.startPlatformWidth, 8);

      // Shockwaves
      s.shockwaves.forEach((sw) => {
        ctx.save();
        ctx.strokeStyle = `rgba(250, 204, 21, ${sw.alpha})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // Stepping Stone Islands
      s.stones.forEach((st, idx) => {
        if (st.crumbled) {
          if (st.shatterPieces) {
            ctx.save();
            ctx.fillStyle = '#64748b';
            st.shatterPieces.forEach((piece) => {
              ctx.fillRect(piece.x, piece.y, piece.w, piece.h);
            });
            ctx.restore();
          }
          return;
        }

        ctx.save();
        // Stone Pillar
        const sGrad = ctx.createLinearGradient(st.x, 0, st.x + st.width, 0);
        sGrad.addColorStop(0, '#1e293b');
        sGrad.addColorStop(0.5, '#334155');
        sGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = sGrad;
        ctx.fillRect(st.x, groundY, st.width, h - groundY);

        ctx.fillStyle = biome.accentColor;
        ctx.fillRect(st.x - 2, groundY - 4, st.width + 4, 8);

        // Concept Plaque
        const cardW = 168;
        const cardH = 50;
        const cardX = st.x + st.width / 2 - cardW / 2;
        const cardY = groundY - 78;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 8);
        ctx.fill();
        ctx.stroke();

        // Badge Pill with Letter ('A', 'B', 'C')
        const badgeLetters = ['A', 'B', 'C'];
        ctx.fillStyle = idx === 0 ? '#3b82f6' : idx === 1 ? '#10b981' : '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(cardX + 6, cardY + 7, 26, 18, 5);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(badgeLetters[idx] || 'A', cardX + 19, cardY + 20);

        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('ISLA', cardX + 38, cardY + 19);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px sans-serif';
        const displayTerm = st.term.length > 20 ? st.term.slice(0, 18) + '...' : st.term;
        ctx.fillText(displayTerm, cardX + 8, cardY + 39);

        // Pointer
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(st.x + st.width / 2 - 6, cardY + cardH);
        ctx.lineTo(st.x + st.width / 2, cardY + cardH + 7);
        ctx.lineTo(st.x + st.width / 2 + 6, cardY + cardH);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.stroke();

        ctx.restore();
      });

      // Animated Chicken
      ctx.save();
      ctx.translate(s.chicken.x, s.chicken.y);
      ctx.rotate(s.chicken.angle);
      ctx.scale(s.chicken.scaleX, s.chicken.scaleY);

      // Body (Plump Golden Chicken)
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.ellipse(0, 0, 15, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Flapping Wing
      const wingY = s.phase === 'jumping' ? Math.sin(s.chicken.flapTime) * 8 : -2;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.ellipse(-3, wingY, 9, 6, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.stroke();

      // Red Comb
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(4, -14, 4, 0, Math.PI * 2);
      ctx.arc(8, -12, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Orange Beak
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(13, -3);
      ctx.lineTo(21, 0);
      ctx.lineTo(13, 3);
      ctx.closePath();
      ctx.fill();

      // Eye
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(8, -5, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(7.5, -5.5, 0.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Particles
      s.particles.forEach((p) => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Floating Scores
      s.floatingScores.forEach((fs) => {
        ctx.save();
        ctx.fillStyle = fs.color;
        ctx.globalAlpha = fs.alpha;
        ctx.font = 'bold 15px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(fs.text, fs.x, fs.y);
        ctx.restore();
      });
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [generateStones, onGameOver, onScoreUpdate]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-between p-2 select-none"
    >
      {/* Unified Stage Canvas: Fills 100% of the stage */}
      <div className="relative w-full flex-1 rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-900">
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>

      {/* Tactile Pressure & Jump Control Bar */}
      <div className="w-full max-w-lg mt-2 flex flex-col items-center gap-1.5 shrink-0">
        {/* Dynamic Jump Power Meter */}
        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300 p-0.5">
          <div
            className="h-full rounded-full transition-all duration-75 bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 shadow-sm"
            style={{ width: `${chargeVisual}%` }}
          />
        </div>

        {/* Hold Button with Tactile Feedback */}
        <button
          onMouseDown={handleStartCharge}
          onMouseUp={handleRelease}
          onTouchStart={handleStartCharge}
          onTouchEnd={handleRelease}
          className={`w-full py-3 px-6 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase transition-all duration-100 flex items-center justify-center gap-2 shadow-lg cursor-pointer select-none active:scale-95 ${
            isPressing
              ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/30 scale-98 shadow-inner'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white'
          }`}
        >
          <Play className={`w-4 h-4 fill-current ${isPressing ? 'animate-bounce' : ''}`} />
          <span>
            {isPressing
              ? `Cargando Salto (${Math.round(chargeVisual)}%)... ¡Suelta para volar a la isla!`
              : 'Mantén Oprimido para Cargar la Potencia del Salto'}
          </span>
        </button>
      </div>
    </div>
  );
};

export const ChickenHopGame: GameDefinition = {
  id: 'chicken-hop',
  title: 'Chicken Leap Academy',
  tagline: 'Carga la potencia del salto y cae en la roca con el concepto correcto',
  category: 'reflex',
  dimension: '2d',
  difficulty: 'medio',
  icon: 'Zap',
  color: '#f59e0b',
  accentColor: '#fde047',
  unlockedByDefault: true,
  unlockCost: 0,
  instruction: 'Mantén oprimido para acumular fuerza de salto y aterriza exactamente en la roca del concepto verificado.',
  controlsDescription: {
    desktop: 'Mantener Espacio / Click para cargar salto',
    mobile: 'Mantener pulsado para cargar salto',
  },
  article: {
    lore: 'El salto de la gallina académica exige tanto cálculo de trayectoria parabólica como discriminación de términos científicos.',
    mechanics: 'La barra de carga mide la fuerza del salto. Identifica la roca con el concepto válido antes de soltar.',
    tips: ['La primera roca requiere un toque breve, la tercera requiere casi 100% de potencia', 'Las rocas distractoras se desmoronan'],
  },
  Component: ChickenHopView,
};
