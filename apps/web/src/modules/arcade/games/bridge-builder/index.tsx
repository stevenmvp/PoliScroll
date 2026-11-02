import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { type GameDefinition, type GameInstanceProps } from '../../types/game';
import { soundManager } from '../../services/soundManager';
import { academicStore } from '../../services/academicStore';
import { themeStore } from '../../services/themeStore';
import { Trophy, CircleDot, Zap, Sparkles } from 'lucide-react';

interface PillarOption {
  x: number;
  width: number;
  term: string;
  isCorrect: boolean;
  explanation: string;
  mistakenOrigin?: string;
  letter: 'A' | 'B' | 'C';
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

export const BridgeBuilderView: React.FC<GameInstanceProps> = ({
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

  const generatePillars = useCallback((): PillarOption[] => {
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

    // 3 Generously Spaced Architectural Columns across 780px canvas
    const slots = [
      { x: 195, width: 85, letter: 'A' as const },
      { x: 385, width: 85, letter: 'B' as const },
      { x: 580, width: 85, letter: 'C' as const },
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
    phase: 'idle' as 'idle' | 'extending' | 'walking' | 'falling_abyss' | 'gameover',
    playerX: 65,
    playerY: 345,
    playerWalkTime: 0,
    stickLength: 0,
    currentPlatformWidth: 105,
    pillars: [] as PillarOption[],
    landedPillar: null as PillarOption | null,
    particles: [] as Particle[],
    shockwaves: [] as Shockwave[],
    floatingScores: [] as FloatingScore[],
    gameOver: false,
    walkTargetX: 0,
    isSuccess: false,
    chargeTimer: 0,
  });

  useEffect(() => {
    stateRef.current.pillars = generatePillars();
  }, [generatePillars]);

  const triggerSparkles = (x: number, y: number, color = '#f59e0b', count = 16) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 100;
      stateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3.5,
        color,
        alpha: 1.0,
      });
    }
  };

  const addScoreText = (x: number, y: number, text: string, color = '#10b981') => {
    stateRef.current.floatingScores.push({ x, y, text, color, alpha: 1.0 });
  };

  const handleStartStretch = () => {
    if (stateRef.current.phase !== 'idle') return;
    stateRef.current.phase = 'extending';
    stateRef.current.stickLength = 0;
    stateRef.current.chargeTimer = 0;
    setIsPressing(true);
    soundManager.playClick('A3');
  };

  const handleRelease = useCallback(() => {
    if (stateRef.current.phase !== 'extending') return;
    setIsPressing(false);
    setChargeVisual(0);

    const s = stateRef.current;
    s.phase = 'walking';
    soundManager.playHit();

    // Check which pillar the horizontal bridge reached
    const stickEnd = s.currentPlatformWidth + s.stickLength;
    const hitPillar = s.pillars.find(
      (p) => stickEnd >= p.x && stickEnd <= p.x + p.width
    );

    s.landedPillar = hitPillar || null;
    s.isSuccess = !!hitPillar && hitPillar.isCorrect;

    if (hitPillar) {
      s.walkTargetX = hitPillar.x + hitPillar.width / 2;
    } else {
      s.walkTargetX = stickEnd + 15;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isAction = [' ', 'ArrowUp', 'Enter'].includes(e.key) || ['Space', 'ArrowUp', 'Enter'].includes(e.code);
      if (isAction) {
        e.preventDefault();
        if (stateRef.current.phase === 'idle') handleStartStretch();
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
      if (s.phase === 'extending') {
        s.chargeTimer += delta;
        // Extend horizontally across the canyon!
        s.stickLength += delta * 360;
        if (s.stickLength > 630) s.stickLength = 630;

        const pct = Math.min(100, (s.stickLength / 630) * 100);
        setChargeVisual(pct);

        // Tactile vibration & shockwave ripples
        if (Math.random() < 0.3) {
          s.shockwaves.push({
            x: s.currentPlatformWidth,
            y: groundY - 4,
            r: 6,
            maxR: 45,
            alpha: 0.8,
          });
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate?.(10);
          }
        }

        // Sparks showering at bridge tip
        if (Math.random() < 0.45) {
          triggerSparkles(s.currentPlatformWidth + s.stickLength, groundY - 4, '#f59e0b', 2);
        }
      } else if (s.phase === 'walking') {
        const walkSpeed = 230;
        s.playerX += walkSpeed * delta;
        s.playerWalkTime += delta * 12;

        if (s.landedPillar && !s.landedPillar.isCorrect && s.playerX >= s.walkTargetX - 12) {
          // Landed on distractor pillar! Column crumbles into debris
          s.landedPillar.crumbled = true;
          s.landedPillar.shatterPieces = [];
          for (let i = 0; i < 16; i++) {
            s.landedPillar.shatterPieces.push({
              x: s.landedPillar.x + (Math.random() * s.landedPillar.width),
              y: groundY + (Math.random() * 50),
              vx: (Math.random() - 0.5) * 160,
              vy: -60 - Math.random() * 120,
              w: 8 + Math.random() * 12,
              h: 8 + Math.random() * 12,
            });
          }

          s.phase = 'falling_abyss';
          soundManager.playLoss();
          academicStore.recordChoice({
            gameId: 'bridge-builder',
            concept: s.landedPillar.term,
            isCorrect: false,
            mistakenOrigin: s.landedPillar.mistakenOrigin,
            quickExplanation: s.landedPillar.explanation,
          });
        } else if (!s.landedPillar && s.playerX >= s.currentPlatformWidth + s.stickLength) {
          // Fell off the end into the chasm
          s.phase = 'falling_abyss';
          soundManager.playLoss();
        } else if (s.isSuccess && s.playerX >= s.walkTargetX) {
          // Reached the correct academic pillar!
          s.playerX = s.walkTargetX;
          s.score += 250;
          s.marbles += 3;
          soundManager.playCorrect();

          academicStore.recordChoice({
            gameId: 'bridge-builder',
            concept: s.landedPillar!.term,
            isCorrect: true,
            quickExplanation: s.landedPillar!.explanation,
          });

          addScoreText(s.walkTargetX, groundY - 50, '+250 ¡CORRECTO!', '#10b981');
          triggerSparkles(s.walkTargetX, groundY - 20, '#10b981', 30);
          confetti({ particleCount: 35, spread: 60, origin: { x: s.walkTargetX / w, y: 0.6 } });

          setScore(s.score);
          setMarbles(s.marbles);
          if (onScoreUpdate) onScoreUpdate(s.score);

          s.phase = 'idle';
          s.stickLength = 0;
          s.playerX = 65;
          s.pillars = generatePillars();
        }
      } else if (s.phase === 'falling_abyss') {
        s.playerY += delta * 450;
        if (s.playerY > h + 40 && !s.gameOver) {
          s.gameOver = true;
          onGameOver({
            score: s.score,
            marblesEarned: s.marbles,
            won: false,
            stats: {
              'Puntaje Final': s.score,
              'Canicas Ganadas': s.marbles,
              'Concepto Analizado': s.landedPillar ? s.landedPillar.term : 'Abismo vacío',
            },
          });
        }
      }

      // Update shockwaves
      for (let i = s.shockwaves.length - 1; i >= 0; i--) {
        const sw = s.shockwaves[i];
        sw.r += delta * 90;
        sw.alpha -= delta * 1.8;
        if (sw.alpha <= 0) s.shockwaves.splice(i, 1);
      }

      // Update particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.alpha -= delta * 1.6;
        if (p.alpha <= 0) s.particles.splice(i, 1);
      }

      // Update floating scores
      for (let i = s.floatingScores.length - 1; i >= 0; i--) {
        const fs = s.floatingScores[i];
        fs.y -= delta * 35;
        fs.alpha -= delta * 1.2;
        if (fs.alpha <= 0) s.floatingScores.splice(i, 1);
      }

      // ==================== RENDER SCENE ====================
      ctx.clearRect(0, 0, w, h);

      // 1. Sky Gradient & Celestial Sun
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, biome.skyGradient[0]);
      skyGrad.addColorStop(1, biome.skyGradient[1]);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, groundY);

      // Celestial Sun Orb
      ctx.save();
      const sunGrad = ctx.createRadialGradient(w * 0.78, 80, 5, w * 0.78, 80, 55);
      sunGrad.addColorStop(0, '#ffffff');
      sunGrad.addColorStop(0.3, biome.sunColor);
      sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(w * 0.78, 80, 55, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Deep Atmospheric Canyon Chasm
      const abyssGrad = ctx.createLinearGradient(0, groundY, 0, h);
      abyssGrad.addColorStop(0, 'rgba(15, 23, 42, 0.85)');
      abyssGrad.addColorStop(1, '#020617');
      ctx.fillStyle = abyssGrad;
      ctx.fillRect(0, groundY, w, h - groundY);

      // 2. Starting Stone Cliff (Left)
      ctx.save();
      const cliffGrad = ctx.createLinearGradient(0, groundY, s.currentPlatformWidth, groundY);
      cliffGrad.addColorStop(0, '#1e293b');
      cliffGrad.addColorStop(1, '#334155');
      ctx.fillStyle = cliffGrad;
      ctx.fillRect(0, groundY, s.currentPlatformWidth, h - groundY);

      // Edge trim
      ctx.fillStyle = biome.accentColor;
      ctx.fillRect(0, groundY - 4, s.currentPlatformWidth, 8);
      ctx.restore();

      // 3. Render Shockwaves at launch point
      s.shockwaves.forEach((sw) => {
        ctx.save();
        ctx.strokeStyle = `rgba(245, 158, 11, ${sw.alpha})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // 4. Render 3 Architectural Columns with Concept Cards
      s.pillars.forEach((p) => {
        if (p.crumbled) {
          if (p.shatterPieces) {
            ctx.save();
            ctx.fillStyle = '#64748b';
            p.shatterPieces.forEach((piece) => {
              ctx.fillRect(piece.x, piece.y, piece.w, piece.h);
            });
            ctx.restore();
          }
          return;
        }

        ctx.save();
        // Pillar Body
        const pGrad = ctx.createLinearGradient(p.x, 0, p.x + p.width, 0);
        pGrad.addColorStop(0, '#1e293b');
        pGrad.addColorStop(0.3, '#334155');
        pGrad.addColorStop(0.7, '#475569');
        pGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = pGrad;
        ctx.fillRect(p.x, groundY, p.width, h - groundY);

        // Capital Head
        ctx.fillStyle = '#64748b';
        ctx.fillRect(p.x - 4, groundY - 6, p.width + 8, 8);
        ctx.fillStyle = biome.accentColor;
        ctx.fillRect(p.x - 2, groundY - 2, p.width + 4, 4);

        // Floating Academic Concept Plaque
        const cardW = 168;
        const cardH = 50;
        const cardX = p.x + p.width / 2 - cardW / 2;
        const cardY = groundY - 78;

        // Card Drop Shadow & Body
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 8);
        ctx.fill();
        ctx.stroke();

        // Badge Pill with Letter ('A', 'B', 'C')
        ctx.fillStyle = p.letter === 'A' ? '#3b82f6' : p.letter === 'B' ? '#10b981' : '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(cardX + 6, cardY + 7, 26, 18, 5);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(p.letter, cardX + 19, cardY + 20);

        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('POSTURA', cardX + 38, cardY + 19);

        // Main Concept Term
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px sans-serif';
        const displayTerm = p.term.length > 20 ? p.term.slice(0, 18) + '...' : p.term;
        ctx.fillText(displayTerm, cardX + 8, cardY + 39);

        // Pointer down to pillar
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(p.x + p.width / 2 - 6, cardY + cardH);
        ctx.lineTo(p.x + p.width / 2, cardY + cardH + 7);
        ctx.lineTo(p.x + p.width / 2 + 6, cardY + cardH);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.stroke();

        ctx.restore();
      });

      // 5. The HORIZONTAL TELESCOPING BRIDGE BEAM
      if (s.stickLength > 0) {
        ctx.save();
        const bStartX = s.currentPlatformWidth;
        const bY = groundY - 4;
        const bLen = s.stickLength;

        // Drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(bStartX, bY + 6, bLen, 5);

        // Main Bridge Beam (Extends Horizontally)
        const bGrad = ctx.createLinearGradient(0, bY - 4, 0, bY + 4);
        bGrad.addColorStop(0, '#f59e0b');
        bGrad.addColorStop(0.5, '#d97706');
        bGrad.addColorStop(1, '#92400e');
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.roundRect(bStartX, bY - 4, bLen, 8, 4);
        ctx.fill();

        // Luminous Core Channel
        if (bLen > 8) {
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(bStartX + 4, bY - 1, bLen - 8, 2);
        }

        // Extension Head Roller with Glow
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(bStartX + bLen, bY, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 6. The Explorer Character
      ctx.save();
      const pX = s.playerX;
      const pY = s.playerY;
      const bob = s.phase === 'walking' ? Math.sin(s.playerWalkTime) * 3 : 0;

      // Character Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(pX, groundY - 2, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.translate(pX, pY + bob);

      // Cloak
      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      const cloakWave = s.phase === 'walking' ? Math.sin(s.playerWalkTime * 1.2) * 5 : 0;
      ctx.moveTo(-7, 6);
      ctx.lineTo(-15 + cloakWave, 16);
      ctx.lineTo(-4, 15);
      ctx.closePath();
      ctx.fill();

      // Body (Expedition Vest)
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.roundRect(-8, -4, 16, 18, 4);
      ctx.fill();

      // Explorer Head
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, -9, 8, 0, Math.PI * 2);
      ctx.fill();

      // Goggles
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-2, -12, 10, 4);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(2, -11, 4, 2);

      ctx.restore();

      // 7. Particles & Floating Scores
      s.particles.forEach((p) => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      s.floatingScores.forEach((fs) => {
        ctx.save();
        ctx.fillStyle = fs.color;
        ctx.globalAlpha = fs.alpha;
        ctx.font = 'bold 15px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 4;
        ctx.fillText(fs.text, fs.x, fs.y);
        ctx.restore();
      });
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [onGameOver, onScoreUpdate, generatePillars]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-between p-2 select-none"
    >
      {/* Unified Stage Canvas: Fills 100% of the stage */}
      <div className="relative w-full flex-1 rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-950">
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>

      {/* Tactile Pressure & Extension Control Bar */}
      <div className="w-full max-w-lg mt-2 flex flex-col items-center gap-1.5 shrink-0">
        {/* Dynamic Force Gauge Bar */}
        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300 p-0.5">
          <div
            className="h-full rounded-full transition-all duration-75 bg-gradient-to-r from-amber-400 via-orange-500 to-indigo-600 shadow-sm"
            style={{ width: `${chargeVisual}%` }}
          />
        </div>

        {/* Hold Button with Tactile Feedback */}
        <button
          onMouseDown={handleStartStretch}
          onMouseUp={handleRelease}
          onTouchStart={handleStartStretch}
          onTouchEnd={handleRelease}
          className={`w-full py-3 px-6 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase transition-all duration-100 flex items-center justify-center gap-2 shadow-lg cursor-pointer select-none active:scale-95 ${
            isPressing
              ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/30 scale-98 shadow-inner'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
          }`}
        >
          <Zap className={`w-4 h-4 ${isPressing ? 'fill-current animate-bounce' : ''}`} />
          <span>
            {isPressing
              ? `Extendiendo Horizontalmente (${Math.round(chargeVisual)}%)... ¡Suelta para Cruzar!`
              : 'Mantén Oprimido para Extender el Puente'}
          </span>
        </button>
      </div>
    </div>
  );
};

export const BridgeBuilderGame: GameDefinition = {
  id: 'bridge-builder',
  title: 'Bridge Academic Extender',
  dimension: '2d',
  category: 'logic',
  difficulty: 'medio',
  tagline: 'Extiende el puente horizontalmente para alcanzar la columna con el concepto correcto.',
  instruction: '¡Mantén oprimido para extender el puente horizontal y suelta para cruzar hacia la columna académica correcta!',
  article: {
    lore: 'El explorador arquitectónico construye puentes de datos a través del cañón conceptual.',
    mechanics: 'Mantén presionado para que el puente se extienda horizontalmente hacia las columnas A, B y C. Cada columna tiene una postura académica. Suelta en el pilar correcto para avanzar; los pilares erróneos colapsan.',
    tips: [
      'Mira el avance horizontal del puente para calcular con precisión la distancia al pilar deseado.',
      'Lee la tarjeta conceptual de cada columna antes de extender el puente.',
      'Las columnas con conceptos falsos colapsan al pisarlas.',
    ],
  },
  controlsDescription: {
    desktop: 'Espacio / Flecha Arriba para extender',
    mobile: 'Mantén presionado el botón en pantalla',
  },
  icon: 'Compass',
  color: '#4F46E5',
  accentColor: '#F59E0B',
  unlockedByDefault: true,
  unlockCost: 0,
  Component: BridgeBuilderView,
};
