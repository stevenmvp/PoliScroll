import React, { useEffect, useRef, useState, useCallback } from 'react';
import { type GameDefinition, type GameInstanceProps } from '../../types/game';
import { soundManager } from '../../services/soundManager';
import { academicStore } from '../../services/academicStore';
import { themeStore } from '../../services/themeStore';
import { SolvabilityVerifier } from '../../services/solvabilityVerifier';
import { VirtualController } from '../../components/VirtualController';
import { Trophy, Heart, CircleDot, GraduationCap, Sparkles, Maximize2, Zap } from 'lucide-react';

interface Car {
  x: number;
  y: number;
  speed: number;
  width: number;
  height: number;
  color: string;
  type: 'coupe' | 'truck' | 'speedster' | 'hover';
}

interface AcademicLog {
  id: string;
  x: number;
  y: number;
  speed: number;
  width: number;
  height: number;
  term: string;
  isCorrect: boolean;
  explanation: string;
  mistakenOrigin?: string;
  sinking?: boolean;
  sinkProgress?: number;
  visited?: boolean;
  badgeLetter: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  gravity?: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

interface GoalBay {
  x: number;
  y: number;
  width: number;
  occupied: boolean;
}

export const FroggerRushView: React.FC<GameInstanceProps> = ({
  onGameOver,
  isFrenzyMode = false,
  onScoreUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [marbles, setMarbles] = useState(0);
  const [combo, setCombo] = useState(0);
  const [activeTopic, setActiveTopic] = useState(() => academicStore.getActiveTopic());

  // Listen to active topic changes
  useEffect(() => {
    return academicStore.subscribe(() => {
      setActiveTopic(academicStore.getActiveTopic());
    });
  }, []);

  // Fullscreen support
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Helper to spawn academic logs across all 4 river lanes (y = 85, 125, 165, 205)
  const generateAcademicLogs = useCallback((): AcademicLog[] => {
    const pool = academicStore.getRandomItemPool(16);
    let pIdx = 0;
    const getItem = (forceCorrect = false) => {
      if (forceCorrect && activeTopic.correctItems.length > 0) {
        const c = activeTopic.correctItems[pIdx % activeTopic.correctItems.length];
        pIdx++;
        return { term: c.term, isCorrect: true, explanation: c.explanation, mistakenOrigin: undefined };
      }
      const it = pool[pIdx % pool.length];
      pIdx++;
      return it;
    };

    const badges = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const logs: AcademicLog[] = [];

    // Lane 1: y = 205, speed = 75 (moving right) - 3 generous logs of 210px
    for (let i = 0; i < 3; i++) {
      const it = getItem(i < 2); // Guaranteed at least 2 safe logs
      logs.push({
        id: `l1-${i}`,
        x: 30 + i * 255,
        y: 205,
        speed: 75,
        width: 210,
        height: 32,
        term: it.term,
        isCorrect: it.isCorrect,
        explanation: it.explanation,
        mistakenOrigin: it.mistakenOrigin,
        badgeLetter: badges[i % badges.length],
      });
    }

    // Lane 2: y = 165, speed = -85 (moving left) - Middle lane always has logs
    for (let i = 0; i < 3; i++) {
      const it = getItem(i < 2);
      logs.push({
        id: `l2-${i}`,
        x: 60 + i * 255,
        y: 165,
        speed: -85,
        width: 210,
        height: 32,
        term: it.term,
        isCorrect: it.isCorrect,
        explanation: it.explanation,
        mistakenOrigin: it.mistakenOrigin,
        badgeLetter: badges[(i + 3) % badges.length],
      });
    }

    // Lane 3: y = 125, speed = 90 (moving right) - Middle lane always has logs
    for (let i = 0; i < 3; i++) {
      const it = getItem(i < 2);
      logs.push({
        id: `l3-${i}`,
        x: 10 + i * 255,
        y: 125,
        speed: 90,
        width: 210,
        height: 32,
        term: it.term,
        isCorrect: it.isCorrect,
        explanation: it.explanation,
        mistakenOrigin: it.mistakenOrigin,
        badgeLetter: badges[(i + 1) % badges.length],
      });
    }

    // Lane 4: y = 85, speed = -75 (moving left)
    for (let i = 0; i < 3; i++) {
      const it = getItem(i < 2);
      logs.push({
        id: `l4-${i}`,
        x: 40 + i * 255,
        y: 85,
        speed: -75,
        width: 210,
        height: 32,
        term: it.term,
        isCorrect: it.isCorrect,
        explanation: it.explanation,
        mistakenOrigin: it.mistakenOrigin,
        badgeLetter: badges[(i + 4) % badges.length],
      });
    }

    return logs;
  }, [activeTopic]);

  const stateRef = useRef({
    frog: {
      gridX: 390,
      gridY: 450,
      visualX: 390,
      visualY: 450,
      targetX: 390,
      targetY: 450,
      hopProgress: 1.0,
      hopStartX: 390,
      hopStartY: 450,
      dir: 'up' as 'up' | 'down' | 'left' | 'right',
      blinkTimer: 0,
      isBlinking: false,
      rideSpeed: 0,
    },
    goalBays: [
      { x: 90, y: 35, width: 60, occupied: false },
      { x: 240, y: 35, width: 60, occupied: false },
      { x: 390, y: 35, width: 60, occupied: false },
      { x: 540, y: 35, width: 60, occupied: false },
      { x: 690, y: 35, width: 60, occupied: false },
    ] as GoalBay[],
    score: 0,
    lives: 3,
    marbles: 0,
    combo: 0,
    gameOver: false,
    waterWaveOffset: 0,
    cars: [
      // Lane 1: y = 295, speed = 120 (moving right)
      { x: 30, y: 295, speed: 120, width: 75, height: 26, color: '#38bdf8', type: 'coupe' },
      { x: 340, y: 295, speed: 120, width: 75, height: 26, color: '#38bdf8', type: 'coupe' },
      { x: 600, y: 295, speed: 120, width: 75, height: 26, color: '#06b6d4', type: 'speedster' },

      // Lane 2: y = 335, speed = -150 (moving left)
      { x: 100, y: 335, speed: -150, width: 78, height: 26, color: '#f43f5e', type: 'speedster' },
      { x: 420, y: 335, speed: -150, width: 78, height: 26, color: '#f43f5e', type: 'speedster' },
      { x: 680, y: 335, speed: -150, width: 78, height: 26, color: '#fb7185', type: 'coupe' },

      // Lane 3: y = 375, speed = 95 (moving right)
      { x: 50, y: 375, speed: 95, width: 110, height: 28, color: '#8b5cf6', type: 'truck' },
      { x: 440, y: 375, speed: 95, width: 110, height: 28, color: '#6366f1', type: 'truck' },

      // Lane 4: y = 410, speed = -125 (moving left)
      { x: 120, y: 410, speed: -125, width: 70, height: 25, color: '#eab308', type: 'hover' },
      { x: 460, y: 410, speed: -125, width: 70, height: 25, color: '#eab308', type: 'hover' },
    ] as Car[],
    logs: [] as AcademicLog[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
  });

  // Spawn initial logs
  useEffect(() => {
    stateRef.current.logs = generateAcademicLogs();
  }, [generateAcademicLogs]);

  // Respawn frog at start line after fall or hit
  const respawnFrog = useCallback((reason: string) => {
    const s = stateRef.current;
    s.lives -= 1;
    s.combo = 0;
    setLives(s.lives);
    setCombo(0);
    soundManager.playLoss();

    // Spawn burst particles at death location
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 40 + Math.random() * 80;
      s.particles.push({
        x: s.frog.visualX,
        y: s.frog.visualY,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: 3 + Math.random() * 3,
        color: reason === 'car' ? '#f43f5e' : '#38bdf8',
        alpha: 1.0,
      });
    }

    s.floatingTexts.push({
      x: s.frog.visualX,
      y: s.frog.visualY - 15,
      text: reason === 'car' ? '¡IMPACTO!' : '¡AL AGUA!',
      color: '#ef4444',
      alpha: 1.0,
      vy: -25,
    });

    s.frog.gridX = 390;
    s.frog.gridY = 450;
    s.frog.visualX = 390;
    s.frog.visualY = 450;
    s.frog.targetX = 390;
    s.frog.targetY = 450;
    s.frog.hopProgress = 1.0;
    s.frog.rideSpeed = 0;

    if (s.lives <= 0) {
      s.gameOver = true;
      onGameOver({
        score: s.score,
        marblesEarned: s.marbles,
        won: false,
        stats: {
          'Puntaje Final': s.score,
          'Canicas Obtenidas': s.marbles,
          'Bahías Conquistadas': s.goalBays.filter((b) => b.occupied).length,
        },
      });
    }
  }, [onGameOver]);

  // Move frog by 40px grid unit
  const moveFrog = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    const s = stateRef.current;
    if (s.gameOver) return;

    // Immediately snap any previous hop so rapid presses or direction changes never freeze
    if (s.frog.hopProgress < 1.0) {
      s.frog.visualX = s.frog.targetX;
      s.frog.visualY = s.frog.targetY;
      s.frog.gridX = s.frog.targetX;
      s.frog.gridY = s.frog.targetY;
    }

    soundManager.playJump();
    s.frog.dir = dir;
    s.frog.hopStartX = s.frog.gridX;
    s.frog.hopStartY = s.frog.gridY;

    const step = 40;
    let nextX = s.frog.gridX;
    let nextY = s.frog.gridY;

    if (dir === 'up') nextY -= step;
    if (dir === 'down') nextY += step;
    if (dir === 'left') nextX -= step;
    if (dir === 'right') nextX += step;

    // Constrain within bounds (w=780, h=480)
    nextX = Math.max(30, Math.min(750, nextX));
    nextY = Math.max(35, Math.min(450, nextY));

    s.frog.gridX = nextX;
    s.frog.gridY = nextY;
    s.frog.targetX = nextX;
    s.frog.targetY = nextY;
    s.frog.hopProgress = 0.0;
  }, []);

  // Keyboard navigation listener with resilient e.key and e.code checks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const code = e.code;
      const isUp = ['ArrowUp', 'KeyW', 'w', 'W'].includes(key) || ['ArrowUp', 'KeyW'].includes(code);
      const isDown = ['ArrowDown', 'KeyS', 's', 'S'].includes(key) || ['ArrowDown', 'KeyS'].includes(code);
      const isLeft = ['ArrowLeft', 'KeyA', 'a', 'A'].includes(key) || ['ArrowLeft', 'KeyA'].includes(code);
      const isRight = ['ArrowRight', 'KeyD', 'd', 'D'].includes(key) || ['ArrowRight', 'KeyD'].includes(code);

      if (isUp) {
        e.preventDefault();
        moveFrog('up');
      } else if (isDown) {
        e.preventDefault();
        moveFrog('down');
      } else if (isLeft) {
        e.preventDefault();
        moveFrog('left');
      } else if (isRight) {
        e.preventDefault();
        moveFrog('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveFrog]);

  // Main 60 FPS Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseWidth = 780;
    const baseHeight = 480;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = baseWidth * dpr;
    canvas.height = baseHeight * dpr;
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      animId = requestAnimationFrame(loop);
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const state = stateRef.current;
      if (state.gameOver) return;

      const biome = themeStore.getBiome();

      // ==================== UPDATE VEHICLES ====================
      state.cars.forEach((car) => {
        car.x += car.speed * dt;
        if (car.speed > 0 && car.x > baseWidth + 50) {
          car.x = -car.width - 40;
        } else if (car.speed < 0 && car.x < -car.width - 50) {
          car.x = baseWidth + 40;
        }
      });

      // ==================== UPDATE LOGS ====================
      state.logs.forEach((log) => {
        log.x += log.speed * dt;
        if (log.speed > 0 && log.x > baseWidth + 60) {
          log.x = -log.width - 40;
        } else if (log.speed < 0 && log.x < -log.width - 60) {
          log.x = baseWidth + 40;
        }

        // Sinking animation if distractor visited
        if (log.sinking && log.sinkProgress !== undefined) {
          log.sinkProgress += dt * 1.5;
        }
      });

      // Water wave phase
      state.waterWaveOffset += dt * 35;

      // ==================== UPDATE FROG PHYSICS ====================
      const frog = state.frog;
      if (frog.hopProgress < 1.0) {
        frog.hopProgress += dt * 5.0; // Snappy 200ms hop
        if (frog.hopProgress > 1.0) frog.hopProgress = 1.0;

        // Smooth cubic ease out
        const t = frog.hopProgress;
        frog.visualX = frog.hopStartX + (frog.targetX - frog.hopStartX) * t;
        frog.visualY = frog.hopStartY + (frog.targetY - frog.hopStartY) * t;
      } else {
        // Carry frog with log if riding
        if (frog.rideSpeed !== 0) {
          frog.visualX += frog.rideSpeed * dt;
          frog.gridX = frog.visualX;
          frog.targetX = frog.visualX;

          // Boundary screen wrap or drown if dragged off-screen
          if (frog.visualX < 10 || frog.visualX > baseWidth - 10) {
            respawnFrog('water');
          }
        }
      }

      // Blink animation
      frog.blinkTimer += dt;
      if (frog.blinkTimer > 3.0) {
        frog.isBlinking = true;
        if (frog.blinkTimer > 3.15) {
          frog.isBlinking = false;
          frog.blinkTimer = 0;
        }
      }

      // ==================== CHECK COLLISIONS ====================
      // 1. Check Highway Cars (y = 280 to 425)
      if (frog.hopProgress >= 0.7 && frog.visualY >= 280 && frog.visualY <= 425) {
        const frogBox = { x: frog.visualX - 12, y: frog.visualY - 10, w: 24, h: 20 };
        for (const car of state.cars) {
          if (
            frogBox.x < car.x + car.width - 6 &&
            frogBox.x + frogBox.w > car.x + 6 &&
            frogBox.y < car.y + car.height - 4 &&
            frogBox.y + frogBox.h > car.y + 4
          ) {
            respawnFrog('car');
            break;
          }
        }
      }

      // 2. Check River Zone (y = 70 to 225)
      let onSafeLog = false;
      frog.rideSpeed = 0;

      if (frog.hopProgress >= 0.7 && frog.visualY >= 70 && frog.visualY <= 225) {
        for (const log of state.logs) {
          const logLeft = log.x;
          const logRight = log.x + log.width;

          if (
            frog.visualX >= logLeft &&
            frog.visualX <= logRight &&
            Math.abs(frog.visualY - log.y) < 22
          ) {
            onSafeLog = true;
            frog.rideSpeed = log.speed;

            // Handle Academic Logic on First Step
            if (!log.visited) {
              log.visited = true;

              academicStore.recordAnswer({
                gameId: 'frogger-rush',
                term: log.term,
                isCorrect: log.isCorrect,
                explanation: log.explanation,
                mistakenOrigin: log.mistakenOrigin,
              });

              if (log.isCorrect) {
                // Correct Concept!
                soundManager.playCorrect();
                state.score += 150;
                state.combo += 1;
                state.marbles += 2;
                setScore(state.score);
                setCombo(state.combo);
                setMarbles(state.marbles);

                // Confetti / Sparkle burst
                for (let i = 0; i < 14; i++) {
                  state.particles.push({
                    x: frog.visualX,
                    y: frog.visualY,
                    vx: (Math.random() - 0.5) * 120,
                    vy: -40 - Math.random() * 80,
                    size: 3 + Math.random() * 2,
                    color: '#34d399',
                    alpha: 1.0,
                    gravity: 120,
                  });
                }

                state.floatingTexts.push({
                  x: frog.visualX,
                  y: frog.visualY - 20,
                  text: `+150 ¡EXCELENTE!`,
                  color: '#10b981',
                  alpha: 1.0,
                  vy: -35,
                });
              } else {
                // Distractor Concept! Log begins sinking
                soundManager.playLoss();
                log.sinking = true;
                log.sinkProgress = 0;
                state.combo = 0;
                setCombo(0);

                state.floatingTexts.push({
                  x: frog.visualX,
                  y: frog.visualY - 20,
                  text: `¡DISTRACTOR!`,
                  color: '#ef4444',
                  alpha: 1.0,
                  vy: -30,
                });

                // Schedule sink drop
                setTimeout(() => {
                  if (Math.abs(stateRef.current.frog.visualY - log.y) < 22) {
                    respawnFrog('water');
                  }
                }, 900);
              }
            } else if (log.sinking && (log.sinkProgress || 0) > 0.8) {
              // Sunk completely
              respawnFrog('water');
            }
            break;
          }
        }

        // If in river and not on any log -> drown!
        if (!onSafeLog) {
          respawnFrog('water');
        }
      }

      // 3. Check Top Goal Bays (y <= 50)
      if (frog.hopProgress >= 0.7 && frog.visualY <= 50) {
        let reachedBay: GoalBay | null = null;
        for (const bay of state.goalBays) {
          if (Math.abs(frog.visualX - bay.x) < bay.width / 2) {
            reachedBay = bay;
            break;
          }
        }

        if (reachedBay && !reachedBay.occupied) {
          reachedBay.occupied = true;
          soundManager.playWin();
          state.score += 500;
          state.marbles += 5;
          setScore(state.score);
          setMarbles(state.marbles);

          state.floatingTexts.push({
            x: reachedBay.x,
            y: reachedBay.y,
            text: '¡BAHÍA CONQUISTADA! +500',
            color: '#f59e0b',
            alpha: 1.0,
            vy: -40,
          });

          // Victory particles
          for (let i = 0; i < 28; i++) {
            state.particles.push({
              x: reachedBay.x,
              y: reachedBay.y,
              vx: (Math.random() - 0.5) * 180,
              vy: -60 - Math.random() * 100,
              size: 4 + Math.random() * 3,
              color: ['#fbbf24', '#38bdf8', '#34d399', '#f43f5e'][Math.floor(Math.random() * 4)],
              alpha: 1.0,
              gravity: 140,
            });
          }

          // Reset frog to start
          frog.gridX = 390;
          frog.gridY = 450;
          frog.visualX = 390;
          frog.visualY = 450;
          frog.targetX = 390;
          frog.targetY = 450;
          frog.hopProgress = 1.0;
          frog.rideSpeed = 0;

          // Check if all 5 bays are filled
          if (state.goalBays.every((b) => b.occupied)) {
            soundManager.playWin();
            state.score += 2000;
            state.marbles += 25;
            setScore(state.score);
            setMarbles(state.marbles);
            // Reset bays for endless mode
            state.goalBays.forEach((b) => (b.occupied = false));
            state.logs = generateAcademicLogs();
          }
        } else if (!reachedBay) {
          // Hit the non-goal bank wall
          respawnFrog('water');
        }
      }

      // ==================== UPDATE PARTICLES & FLOATING TEXTS ====================
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.gravity) p.vy += p.gravity * dt;
        p.alpha -= dt * 1.6;
        if (p.alpha <= 0) state.particles.splice(i, 1);
      }

      for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
        const ft = state.floatingTexts[i];
        ft.y += ft.vy * dt;
        ft.alpha -= dt * 1.2;
        if (ft.alpha <= 0) state.floatingTexts.splice(i, 1);
      }

      // ==================== RENDER SCENE ====================
      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Top Goal Sanctuary Bank (y = 0 to 70)
      const sanctuaryGrad = ctx.createLinearGradient(0, 0, 0, 70);
      sanctuaryGrad.addColorStop(0, '#064e3b');
      sanctuaryGrad.addColorStop(1, '#022c22');
      ctx.fillStyle = sanctuaryGrad;
      ctx.fillRect(0, 0, baseWidth, 70);

      // Gold Trim Edge
      ctx.fillStyle = '#059669';
      ctx.fillRect(0, 66, baseWidth, 4);

      // Draw 5 Goal Bays
      state.goalBays.forEach((bay) => {
        ctx.save();
        ctx.fillStyle = '#06281e';
        ctx.beginPath();
        ctx.roundRect(bay.x - bay.width / 2, bay.y - 20, bay.width, 44, 12);
        ctx.fill();
        ctx.strokeStyle = bay.occupied ? '#10b981' : '#047857';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (bay.occupied) {
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(bay.x, bay.y, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', bay.x, bay.y);
        } else {
          const pulse = 0.5 + Math.sin(currentTime * 0.005 + bay.x) * 0.4;
          ctx.fillStyle = `rgba(16, 185, 129, ${pulse * 0.35})`;
          ctx.beginPath();
          ctx.arc(bay.x, bay.y, 12, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#34d399';
          ctx.beginPath();
          ctx.arc(bay.x, bay.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 2. Crystal River (y = 70 to 230)
      const waterGrad = ctx.createLinearGradient(0, 70, 0, 230);
      if (biome.id === 'snow') {
        waterGrad.addColorStop(0, '#0284c7');
        waterGrad.addColorStop(1, '#0369a1');
      } else if (biome.id === 'desert') {
        waterGrad.addColorStop(0, '#b45309');
        waterGrad.addColorStop(1, '#78350f');
      } else {
        waterGrad.addColorStop(0, '#0369a1');
        waterGrad.addColorStop(0.5, '#0284c7');
        waterGrad.addColorStop(1, '#075985');
      }
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, 70, baseWidth, 160);

      // Ambient Animated Water Waves
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = 1.5;
      for (let wy = 90; wy <= 220; wy += 38) {
        ctx.beginPath();
        for (let wx = 0; wx <= baseWidth; wx += 20) {
          const waveHeight = Math.sin((wx + state.waterWaveOffset) * 0.03 + wy) * 3;
          if (wx === 0) ctx.moveTo(wx, wy + waveHeight);
          else ctx.lineTo(wx, wy + waveHeight);
        }
        ctx.stroke();
      }
      ctx.restore();

      // 3. Render Academic Rafts / Logs
      state.logs.forEach((log) => {
        ctx.save();
        const sinkScale = log.sinking ? Math.max(0, 1 - (log.sinkProgress || 0)) : 1.0;
        if (sinkScale <= 0) {
          ctx.restore();
          return;
        }

        ctx.translate(log.x + log.width / 2, log.y);
        ctx.scale(sinkScale, sinkScale);
        ctx.translate(-(log.x + log.width / 2), -log.y);

        // Raft Water Wake / Ripples
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.beginPath();
        const wakeX = log.speed > 0 ? log.x + log.width : log.x;
        ctx.arc(wakeX, log.y, 16, 0, Math.PI * 2);
        ctx.fill();

        // Raft Body (Carved Hardwood or Floater)
        const raftGrad = ctx.createLinearGradient(0, log.y - 16, 0, log.y + 16);
        if (log.visited && log.isCorrect) {
          raftGrad.addColorStop(0, '#059669');
          raftGrad.addColorStop(1, '#022c22');
        } else if (log.sinking) {
          raftGrad.addColorStop(0, '#dc2626');
          raftGrad.addColorStop(1, '#450a0a');
        } else {
          raftGrad.addColorStop(0, '#78350f');
          raftGrad.addColorStop(0.5, '#5c2b0c');
          raftGrad.addColorStop(1, '#3b1704');
        }
        ctx.fillStyle = raftGrad;
        ctx.beginPath();
        ctx.roundRect(log.x, log.y - 15, log.width, log.height, 8);
        ctx.fill();

        // Metal Binding Straps
        ctx.fillStyle = '#d97706';
        ctx.fillRect(log.x + 12, log.y - 15, 4, log.height);
        ctx.fillRect(log.x + log.width - 16, log.y - 15, 4, log.height);

        // Floating Academic Card Plaque
        const cardBg = log.visited && log.isCorrect ? 'rgba(6, 78, 59, 0.95)' : 'rgba(15, 23, 42, 0.9)';
        ctx.fillStyle = cardBg;
        ctx.beginPath();
        ctx.roundRect(log.x + 22, log.y - 12, log.width - 44, 24, 6);
        ctx.fill();

        // Border Glow
        ctx.strokeStyle = log.visited && log.isCorrect ? '#34d399' : log.sinking ? '#f87171' : '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Badge Circle with Letter
        ctx.fillStyle = log.visited && log.isCorrect ? '#10b981' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(log.x + 34, log.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(log.badgeLetter, log.x + 34, log.y);

        // Academic Term Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';

        let displayTerm = log.term;
        const maxTextW = log.width - 66;
        if (ctx.measureText(displayTerm).width > maxTextW) {
          while (displayTerm.length > 3 && ctx.measureText(displayTerm + '…').width > maxTextW) {
            displayTerm = displayTerm.slice(0, -1);
          }
          displayTerm += '…';
        }
        ctx.fillText(displayTerm, log.x + 48, log.y);

        ctx.restore();
      });

      // 4. Central Safe Median Island (y = 230 to 275)
      const medianGrad = ctx.createLinearGradient(0, 230, 0, 275);
      medianGrad.addColorStop(0, '#1e293b');
      medianGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = medianGrad;
      ctx.fillRect(0, 230, baseWidth, 45);

      // Median Curb Lines
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 230, baseWidth, 3);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, 272, baseWidth, 3);

      // Safety Beacons along the median
      for (let bx = 40; bx < baseWidth; bx += 80) {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(bx, 252, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Highway Road (y = 275 to 430)
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 275, baseWidth, 155);

      // Glowing Lane Divider Dashes
      ctx.save();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 20]);
      [315, 355, 395].forEach((laneY) => {
        ctx.beginPath();
        ctx.moveTo(0, laneY);
        ctx.lineTo(baseWidth, laneY);
        ctx.stroke();
      });
      ctx.restore();

      // 6. Render Futuristic Vehicles
      state.cars.forEach((car) => {
        ctx.save();
        const lightDir = car.speed > 0 ? 1 : -1;
        const noseX = lightDir > 0 ? car.x + car.width : car.x;

        // Volumetric Headlight Beams
        const headlightGrad = ctx.createRadialGradient(
          noseX,
          car.y + 2,
          5,
          noseX + lightDir * 75,
          car.y + 2,
          75
        );
        headlightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        headlightGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = headlightGrad;
        ctx.beginPath();
        ctx.moveTo(noseX, car.y - 6);
        ctx.lineTo(noseX + lightDir * 75, car.y - 24);
        ctx.lineTo(noseX + lightDir * 75, car.y + 28);
        ctx.lineTo(noseX, car.y + 10);
        ctx.closePath();
        ctx.fill();

        // Vehicle Chassis Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.roundRect(car.x, car.y - 10, car.width, car.height + 4, 6);
        ctx.fill();

        // Vehicle Body
        const bodyGrad = ctx.createLinearGradient(car.x, car.y - 12, car.x, car.y + 12);
        bodyGrad.addColorStop(0, car.color);
        bodyGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.roundRect(car.x, car.y - 12, car.width, car.height, 6);
        ctx.fill();

        // Tinted Canopy Windshield
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.roundRect(car.x + 14, car.y - 9, car.width - 28, car.height - 6, 4);
        ctx.fill();

        // Taillights
        const tailX = lightDir > 0 ? car.x : car.x + car.width - 4;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(tailX, car.y - 10, 4, 5);
        ctx.fillRect(tailX, car.y + 5, 4, 5);

        // Headlight Lenses
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(noseX - (lightDir > 0 ? 4 : 0), car.y - 10, 4, 5);
        ctx.fillRect(noseX - (lightDir > 0 ? 4 : 0), car.y + 5, 4, 5);

        ctx.restore();
      });

      // 7. Starting Platform Bank (y = 430 to 480)
      const startGrad = ctx.createLinearGradient(0, 430, 0, 480);
      startGrad.addColorStop(0, '#1e293b');
      startGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = startGrad;
      ctx.fillRect(0, 430, baseWidth, 50);

      // Gold Start Line
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, 430, baseWidth, 3);

      // Grid Beacons
      for (let sx = 40; sx < baseWidth; sx += 40) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.arc(sx, 455, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 8. Render Animated Frog
      ctx.save();
      const hopLift = Math.sin(frog.hopProgress * Math.PI) * 18;
      ctx.translate(frog.visualX, frog.visualY - hopLift);

      // Drop Shadow
      ctx.save();
      ctx.translate(0, hopLift);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      const shadowScale = Math.max(0.3, 1.0 - (hopLift / 18) * 0.5);
      ctx.beginPath();
      ctx.ellipse(0, 10, 16 * shadowScale, 8 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Hop Squash & Stretch
      const stretch = 1.0 + Math.sin(frog.hopProgress * Math.PI) * 0.28;
      const squash = 1.0 / stretch;
      if (frog.dir === 'up' || frog.dir === 'down') {
        ctx.scale(squash, stretch);
      } else {
        ctx.scale(stretch, squash);
      }

      // Frog Outer Body (Emerald Gradient)
      const frogGrad = ctx.createRadialGradient(0, -4, 4, 0, 0, 18);
      frogGrad.addColorStop(0, '#34d399');
      frogGrad.addColorStop(0.6, '#10b981');
      frogGrad.addColorStop(1, '#047857');
      ctx.fillStyle = frogGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#064e3b';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Hind Legs
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(-13, 8, 6, 0, Math.PI * 2);
      ctx.arc(13, 8, 6, 0, Math.PI * 2);
      ctx.fill();

      // Front Flippers
      ctx.beginPath();
      ctx.arc(-12, -8, 5, 0, Math.PI * 2);
      ctx.arc(12, -8, 5, 0, Math.PI * 2);
      ctx.fill();

      // Large Expressive Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-7, -10, 6, 0, Math.PI * 2);
      ctx.arc(7, -10, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#064e3b';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Pupils / Blinking
      if (frog.isBlinking) {
        ctx.strokeStyle = '#064e3b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-11, -10);
        ctx.lineTo(-3, -10);
        ctx.moveTo(3, -10);
        ctx.lineTo(11, -10);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(-7, -10, 3, 0, Math.PI * 2);
        ctx.arc(7, -10, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-8, -11, 1.2, 0, Math.PI * 2);
        ctx.arc(6, -11, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // 9. Render Particles & Floating Feedback Texts
      state.particles.forEach((p) => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      state.floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.alpha;
        ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 6;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      ctx.restore();

      if (onScoreUpdate) onScoreUpdate(state.score);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [onGameOver, onScoreUpdate, generateAcademicLogs, respawnFrog]);

  const handleCanvasPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 780 / rect.width;
    const scaleY = 480 / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const dx = clickX - stateRef.current.frog.visualX;
    const dy = clickY - stateRef.current.frog.visualY;

    if (Math.abs(dy) > Math.abs(dx)) {
      if (dy < 0) moveFrog('up');
      else moveFrog('down');
    } else {
      if (dx < 0) moveFrog('left');
      else moveFrog('right');
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col items-center justify-between p-2 select-none"
    >
      {/* Unified Stage Canvas: Fills 100% of the stage */}
      <div className="relative w-full flex-1 rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-950">
        <canvas
          ref={canvasRef}
          onPointerDown={handleCanvasPointer}
          className="block w-full h-full cursor-pointer"
        />
      </div>

      {/* Bottom Tactile Helper & Mobile D-Pad */}
      <div className="w-full max-w-xl mt-1.5 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-600 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Toca la pantalla o usa Flechas/WASD para mover la rana. ¡Los distractores se hunden!</span>
        </div>

        <VirtualController
          onDirection={(dir) => moveFrog(dir)}
          showDpad={true}
          showAction={false}
        />
      </div>
    </div>
  );
};

export const FroggerRushGame: GameDefinition = {
  id: 'frogger-rush',
  title: 'Frogger Cyber Rush',
  dimension: '2d',
  category: 'reflex',
  difficulty: 'medio',
  tagline: 'Cruza la autopista y navega el río saltando solo en troncos con conceptos válidos.',
  instruction: '¡Avanza con Flechas o WASD esquivando coches y salta solo en troncos con conceptos correctos!',
  article: {
    lore: 'La rana investigadora navega canales de enfriamiento donde los conceptos erróneos colapsan la estructura de flotación.',
    mechanics: 'Cruza esquivando vehículos a gran velocidad. En el río, cada balsa lleva un concepto académico. Si pisas el concepto correcto flotas y sumas puntos; si pisas un distractor, el tronco se hunde.',
    tips: [
      'Hay 4 carriles continuos de troncos para cruzar con ritmo.',
      'Compara la letra y el concepto antes de saltar para evitar los distractores que se hunden.',
      'Conquista las 5 bahías sagradas superiores para bonos épicos de canicas y puntaje.',
    ],
  },
  controlsDescription: {
    desktop: 'Flechas / WASD para moverte',
    mobile: 'D-Pad táctil en pantalla',
  },
  icon: 'Compass',
  color: '#10B981',
  accentColor: '#06B6D4',
  unlockedByDefault: true,
  unlockCost: 0,
  Component: FroggerRushView,
};
