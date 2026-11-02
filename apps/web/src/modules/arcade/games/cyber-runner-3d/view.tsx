import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { type GameInstanceProps } from '../../types/game';
import { createInitialRunnerState, type RunnerState } from './model';
import { RunnerController } from './controller';
import {
  createCyberHovercraft,
  createBarrierMesh,
  createHighLaserMesh,
  createCyberDroneMesh,
  createDoubleGateMesh,
  createSpeedRingMesh,
  createHighwayGantryMesh,
  createMarbleMesh,
} from './assets';
import { themeStore } from '../../services/themeStore';
import { VirtualController } from '../../components/VirtualController';
import { Heart, Trophy, Zap, Gauge, Target, Sparkles, ArrowDown } from 'lucide-react';

export const CyberRunnerView: React.FC<GameInstanceProps> = ({
  onGameOver,
  isFrenzyMode = false,
  frenzyTimeLeft = 10,
  onScoreUpdate,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hudState, setHudState] = useState<RunnerState>(createInitialRunnerState());
  const [isHitFlashing, setIsHitFlashing] = useState(false);
  const [fpsMode, setFpsMode] = useState<60 | 30>(60);
  const [measuredFps, setMeasuredFps] = useState(60);

  const stateRef = useRef<RunnerState>(createInitialRunnerState());
  const controllerRef = useRef<RunnerController>(new RunnerController());
  const fpsModeRef = useRef<60 | 30>(60);

  const toggleFpsMode = useCallback(() => {
    const next = fpsModeRef.current === 60 ? 30 : 60;
    fpsModeRef.current = next;
    setFpsMode(next);
    stateRef.current.targetFps = next;
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const biome = themeStore.getBiome();

    // 1. Scene, Camera, Renderer with Biome-reactive atmospheric lighting
    const scene = new THREE.Scene();
    const bgCol = new THREE.Color(biome.fogColor);
    scene.background = bgCol;
    scene.fog = new THREE.FogExp2(bgCol, 0.016);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      260
    );
    camera.position.set(0, 3.8, 6.8);
    camera.lookAt(0, 1.2, -6);

    const isEco = fpsModeRef.current === 30;
    const renderer = new THREE.WebGLRenderer({
      antialias: !isEco,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isEco ? 1.0 : Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = !isEco;
    container.appendChild(renderer.domElement);

    // 2. Lighting Rig
    const ambient = new THREE.HemisphereLight(0x38bdf8, 0x050816, 0.95);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(6, 14, 8);
    keyLight.castShadow = !isEco;
    scene.add(keyLight);

    // 3. Cyber Highway & Elevated Curbs
    const roadWidth = 9.0;
    const roadLength = 240;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength, 1, 30);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x080e1a,
      roughness: 0.8,
      metalness: 0.25,
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.z = -60;
    scene.add(road);

    // Dynamic grid lines on road
    const gridHelper = new THREE.GridHelper(roadLength, 60, 0x06b6d4, 0x1e293b);
    gridHelper.position.set(0, 0.02, -60);
    scene.add(gridHelper);

    // Elevated Highway Barriers (Left & Right)
    const curbGeo = new THREE.BoxGeometry(0.35, 0.65, roadLength);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const leftCurb = new THREE.Mesh(curbGeo, curbMat);
    leftCurb.position.set(-roadWidth / 2, 0.3, -60);
    scene.add(leftCurb);

    const rightCurb = new THREE.Mesh(curbGeo, curbMat);
    rightCurb.position.set(roadWidth / 2, 0.3, -60);
    scene.add(rightCurb);

    // Glowing Neon Rails on Curbs
    const railGeo = new THREE.BoxGeometry(0.12, 0.12, roadLength);
    const railMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });
    const leftRail = new THREE.Mesh(railGeo, railMat);
    leftRail.position.set(-roadWidth / 2, 0.65, -60);
    scene.add(leftRail);

    const rightRail = new THREE.Mesh(railGeo, railMat);
    rightRail.position.set(roadWidth / 2, 0.65, -60);
    scene.add(rightRail);

    // 4. Environmental Depth: Overhead Gantries
    const gantries: THREE.Group[] = [];
    for (let i = 0; i < 4; i++) {
      const g = createHighwayGantryMesh();
      g.position.z = -30 - i * 65;
      scene.add(g);
      gantries.push(g);
    }

    // 6. Player Hovercraft
    const playerCraft = createCyberHovercraft();
    scene.add(playerCraft);

    // Obstacle and Marble pools
    const obstacleMeshMap = new Map<number, THREE.Object3D>();
    const marbleMeshMap = new Map<number, THREE.Mesh>();

    const clock = new THREE.Clock();
    let animId: number;
    let lastRenderTime = performance.now();
    let frameCount = 0;
    let lastFpsCalcTime = performance.now();
    let cameraShake = 0;

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const targetDelta = 1000 / fpsModeRef.current;
      const elapsed = now - lastRenderTime;

      // Throttle for 30 FPS Eco Mode
      if (fpsModeRef.current === 30 && elapsed < targetDelta - 3) {
        return;
      }
      lastRenderTime = now;

      frameCount++;
      if (now - lastFpsCalcTime >= 1000) {
        setMeasuredFps(frameCount);
        stateRef.current.actualFps = frameCount;
        frameCount = 0;
        lastFpsCalcTime = now;
      }

      const delta = Math.min(clock.getDelta(), 0.08);

      controllerRef.current.update(stateRef.current, delta, () => {
        setIsHitFlashing(true);
        cameraShake = 0.45;
        setTimeout(() => setIsHitFlashing(false), 200);
      });

      // Synchronize player hovercraft
      playerCraft.position.x = stateRef.current.currentX;
      playerCraft.position.y = stateRef.current.playerY + 0.35 + Math.sin(clock.getElapsedTime() * 7) * 0.04;
      playerCraft.position.z = 0;

      // Ducking scale & lowering
      if (stateRef.current.isDucking) {
        playerCraft.scale.set(1.15, 0.42, 1.15);
        playerCraft.position.y = 0.18;
      } else {
        playerCraft.scale.set(1.0, 1.0, 1.0);
      }

      // Smooth banking on lane shift
      const tilt = (stateRef.current.targetX - stateRef.current.currentX) * -0.28;
      playerCraft.rotation.z = tilt;

      // Camera FOV and positioning with dynamic speed lines
      const targetFov = stateRef.current.speed > 45 ? 68 : 60;
      camera.fov += (targetFov - camera.fov) * delta * 5;

      // Camera shake decay
      if (cameraShake > 0) {
        camera.position.x = (Math.random() - 0.5) * cameraShake;
        camera.position.y = 3.8 + (Math.random() - 0.5) * cameraShake;
        cameraShake -= delta * 1.5;
        if (cameraShake < 0) cameraShake = 0;
      } else {
        camera.position.x = 0;
        camera.position.y = 3.8;
      }
      camera.updateProjectionMatrix();

      // Road animation
      gridHelper.position.z = ((stateRef.current.distance * 1.5) % 4) - 60;

      // Update Overhead Gantries (moving toward player)
      gantries.forEach((g) => {
        g.position.z += stateRef.current.speed * delta;
        if (g.position.z > 15) {
          g.position.z = -230;
        }
      });

      // Sync obstacle meshes
      const activeObsIds = new Set(stateRef.current.obstacles.map((o) => o.id));
      obstacleMeshMap.forEach((mesh, id) => {
        if (!activeObsIds.has(id)) {
          scene.remove(mesh);
          obstacleMeshMap.delete(id);
        }
      });

      stateRef.current.obstacles.forEach((obs) => {
        let mesh = obstacleMeshMap.get(obs.id);
        if (!mesh) {
          if (obs.type === 'barrier') {
            mesh = createBarrierMesh();
          } else if (obs.type === 'high_laser') {
            mesh = createHighLaserMesh();
          } else if (obs.type === 'drone') {
            mesh = createCyberDroneMesh();
          } else if (obs.type === 'double_gate') {
            mesh = createDoubleGateMesh();
          } else if (obs.type === 'speed_ring') {
            mesh = createSpeedRingMesh();
          } else {
            mesh = createBarrierMesh();
          }
          scene.add(mesh);
          obstacleMeshMap.set(obs.id, mesh);
        }

        if (obs.type === 'drone') {
          const droneX = obs.lane * 2.2 + (obs.droneOffset || 0);
          mesh.position.set(droneX, 1.35 + Math.sin(now * 0.006 + obs.id) * 0.18, obs.z);
          mesh.rotation.y += delta * 2.5;
        } else if (obs.type === 'high_laser') {
          mesh.position.set(obs.lane * 2.2, 0, obs.z);
        } else if (obs.type === 'double_gate') {
          mesh.position.set(obs.lane * 2.2, 0, obs.z);
        } else if (obs.type === 'speed_ring') {
          mesh.position.set(obs.lane * 2.2, 1.45, obs.z);
          mesh.rotation.z += delta * 1.8;
        } else {
          mesh.position.set(obs.lane * 2.2, 0, obs.z);
        }
      });

      // Sync marble meshes
      const activeMarbleIds = new Set(stateRef.current.marbleItems.map((m) => m.id));
      marbleMeshMap.forEach((mesh, id) => {
        if (!activeMarbleIds.has(id)) {
          scene.remove(mesh);
          mesh.geometry.dispose();
          marbleMeshMap.delete(id);
        }
      });
      stateRef.current.marbleItems.forEach((m) => {
        let mesh = marbleMeshMap.get(m.id);
        if (!mesh) {
          mesh = createMarbleMesh();
          scene.add(mesh);
          marbleMeshMap.set(m.id, mesh);
        }
        mesh.position.set(m.lane * 2.2, 0.65 + Math.sin(now * 0.007 + m.id) * 0.1, m.z);
        mesh.rotation.y += delta * 3;
      });

      if (onScoreUpdate) {
        onScoreUpdate(stateRef.current.score);
      }

      setHudState({ ...stateRef.current });

      // Game Over check
      if (stateRef.current.gameOver && !isFrenzyMode) {
        cancelAnimationFrame(animId);
        onGameOver({
          score: stateRef.current.score,
          marblesEarned: stateRef.current.marbles,
          won: false,
          stats: {
            'Distancia': `${Math.floor(stateRef.current.distance)}m`,
            'Velocidad Máx': `${Math.floor(stateRef.current.speed)} km/h`,
            'Combo Máximo': `x${stateRef.current.maxCombo}`,
            'Canicas': stateRef.current.marbles,
          },
        });
        return;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      obstacleMeshMap.forEach((m) => scene.remove(m));
      marbleMeshMap.forEach((m) => {
        scene.remove(m);
        m.geometry.dispose();
      });
      gantries.forEach((g) => scene.remove(g));
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onGameOver, isFrenzyMode, onScoreUpdate]);

  // STABLE KEYBOARD INPUT CAPTURE WITH FULL e.preventDefault()
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keysToIntercept = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Spacebar', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'];
      if (keysToIntercept.includes(e.key)) {
        // Prevent default browser page scrolling or focus loss!
        e.preventDefault();
        e.stopPropagation();
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        controllerRef.current.moveLeft(stateRef.current);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        controllerRef.current.moveRight(stateRef.current);
      } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        controllerRef.current.jump(stateRef.current);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        controllerRef.current.duck(stateRef.current);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);

  const objective = hudState.activeObjective;
  const objProgress = Math.min(100, (objective.current / objective.target) * 100);

  return (
    <div className="relative w-full h-full min-h-[460px] md:min-h-[580px] bg-slate-950 overflow-hidden select-none outline-none">
      <div ref={mountRef} className="w-full h-full absolute inset-0" />

      {/* Screen Red Flash on Hit */}
      {isHitFlashing && (
        <div className="absolute inset-0 bg-red-600/35 pointer-events-none z-20 animate-pulse" />
      )}

      {/* Near-Miss Alert Banner */}
      {hudState.nearMissAlert && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in zoom-in-75 duration-150">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs md:text-sm px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.7)] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 fill-current" />
            <span>{hudState.nearMissAlert}</span>
          </div>
        </div>
      )}

      {/* Mission Accomplished Banner */}
      {hudState.objectiveBanner && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="bg-violet-950/90 border border-violet-400 text-white font-extrabold text-xs md:text-sm px-5 py-2 rounded-2xl shadow-[0_0_25px_rgba(139,92,246,0.8)] backdrop-blur-md flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>{hudState.objectiveBanner}</span>
          </div>
        </div>
      )}

      {/* Top HUD: Score, Marbles, Multiplier, FPS Mode */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-30 pointer-events-none">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-300 bg-slate-950/75 border border-slate-800/80 px-3.5 py-2 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Trophy className="w-4 h-4" />
            <span className="font-mono tabular-nums text-sm text-white font-bold">{hudState.score}</span>
          </div>
          <span className="text-slate-700" aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span>Canicas:</span>
            <span className="font-mono tabular-nums text-sm text-amber-300 font-bold">{hudState.marbles}</span>
          </div>
          <span className="text-slate-700" aria-hidden="true">·</span>
          {/* Combo Multiplier */}
          <div className="flex items-center gap-1 text-violet-400 font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span className="font-mono text-cyan-300">x{hudState.multiplier}</span>
          </div>
        </div>

        {/* Lives + FPS Mode Toggle */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* 60 FPS / 30 FPS Cap Toggle */}
          <button
            onClick={toggleFpsMode}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold border transition-colors flex items-center gap-1 shadow-sm ${
              fpsMode === 60
                ? 'bg-slate-900/80 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60'
                : 'bg-slate-900/80 text-amber-400 border-amber-500/30 hover:border-amber-500/60'
            }`}
            title="Alternar entre 60 FPS y 30 FPS optimizado"
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>{fpsMode} FPS ({measuredFps})</span>
          </button>

          {/* Lives Indicator */}
          <div className="flex items-center gap-1 bg-slate-950/75 border border-slate-800/80 px-3 py-1.5 rounded-xl backdrop-blur-md">
            {!isFrenzyMode ? (
              <div className="flex items-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-4 h-4 transition-colors ${
                      i < hudState.lives ? 'text-red-500 fill-red-500' : 'text-slate-800'
                    }`}
                  />
                ))}
              </div>
            ) : (
              <div className="text-xs font-mono font-bold text-violet-400">
                FRENESÍ: {Math.ceil(frenzyTimeLeft)}s
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Objective Banner Widget */}
      <div className="absolute top-16 left-3 z-30 pointer-events-none">
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl px-3.5 py-2 max-w-[260px] backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1">
            <span className="flex items-center gap-1 text-cyan-400">
              <Target className="w-3.5 h-3.5" />
              <span>Misión Activa</span>
            </span>
            <span className="font-mono text-amber-300">
              {objective.current}/{objective.target}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">{objective.text}</div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-200"
              style={{ width: `${objProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Speedometer telemetry */}
      <div className="absolute bottom-16 md:bottom-12 right-3 z-30 pointer-events-none bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-xl backdrop-blur-md text-right">
        <div className="text-[10px] text-slate-500 uppercase font-mono">Velocidad</div>
        <div className="text-base font-black font-mono text-cyan-400 tabular-nums">
          {Math.floor(hudState.speed)} <span className="text-[10px] text-slate-400">KM/H</span>
        </div>
      </div>

      {/* Helper Desktop prompt */}
      <div className="hidden md:flex absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-slate-400 bg-slate-900/70 border border-slate-800 px-3.5 py-1.5 rounded-xl pointer-events-none z-30">
        [<kbd className="text-amber-400 font-mono">A/D</kbd>] Moverse · [<kbd className="text-cyan-400 font-mono">Espacio</kbd>] Saltar obstáculos · [<kbd className="text-pink-400 font-mono">S / Abajo</kbd>] Deslizarse bajo láseres
      </div>

      {/* Virtual Mobile Controller with Jump AND Duck actions */}
      <div className="md:hidden fixed bottom-3 left-0 right-0 px-4 flex items-center justify-between pointer-events-none z-40">
        <VirtualController
          onDirection={(dir) => {
            if (dir === 'left') controllerRef.current.moveLeft(stateRef.current);
            if (dir === 'right') controllerRef.current.moveRight(stateRef.current);
            if (dir === 'up') controllerRef.current.jump(stateRef.current);
            if (dir === 'down') controllerRef.current.duck(stateRef.current);
          }}
          onAction={() => controllerRef.current.jump(stateRef.current)}
          actionLabel="SALTAR"
          showDpad={true}
          showAction={true}
        />

        {/* Quick Duck Button for Mobile */}
        <button
          type="button"
          onTouchStart={(e) => { e.preventDefault(); controllerRef.current.duck(stateRef.current); }}
          onClick={() => controllerRef.current.duck(stateRef.current)}
          className="pointer-events-auto fixed bottom-20 right-4 px-4 py-3 bg-pink-600 active:bg-pink-500 text-white font-bold rounded-2xl border border-pink-400/40 shadow-xl flex items-center gap-1.5 text-xs active:scale-95 transition-all"
        >
          <ArrowDown className="w-4 h-4" />
          <span>DESLIZAR</span>
        </button>
      </div>
    </div>
  );
};
