import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { type GameInstanceProps } from '../../types/game';
import { createInitialAsteroidDriftState, type AsteroidDriftState } from './model';
import { AsteroidDriftController } from './controller';
import { createProceduralSpaceship, createAsteroidMesh, createCosmicOrbMesh } from './assets';
import { themeStore } from '../../services/themeStore';
import { VirtualController } from '../../components/VirtualController';
import { Heart, Trophy } from 'lucide-react';

export const AsteroidDrift3DView: React.FC<GameInstanceProps> = ({
  onGameOver,
  isFrenzyMode = false,
  frenzyTimeLeft = 10,
  onScoreUpdate,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hudState, setHudState] = useState<AsteroidDriftState>(createInitialAsteroidDriftState());
  const [isHitFlashing, setIsHitFlashing] = useState(false);

  const stateRef = useRef<AsteroidDriftState>(createInitialAsteroidDriftState());
  const controllerRef = useRef<AsteroidDriftController>(new AsteroidDriftController());

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const biome = themeStore.getBiome();

    // 1. Scene, Camera, Renderer with Biome-reactive environment
    const scene = new THREE.Scene();
    const bgCol = new THREE.Color(biome.fogColor);
    scene.background = bgCol;
    scene.fog = new THREE.FogExp2(bgCol, 0.012);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      250
    );
    camera.position.set(0, 2.5, 6.5);
    camera.lookAt(0, 0, -8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Dynamic Lighting
    const ambient = new THREE.AmbientLight(0x38bdf8, 0.6);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff7ed, 1.8);
    sun.position.set(10, 15, 10);
    scene.add(sun);

    // 3. Lightweight Starfield (Single mesh translation, zero CPU-GPU vertex upload)
    const starCount = 60;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 100;
      starPositions[i + 1] = (Math.random() - 0.5) * 60;
      starPositions[i + 2] = -Math.random() * 120;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x93c5fd, size: 0.6, transparent: true, opacity: 0.7 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // 4. Player Ship
    const spaceship = createProceduralSpaceship();
    scene.add(spaceship);

    // Mesh Pools
    const asteroidMeshMap = new Map<number, THREE.Mesh>();
    const orbMeshMap = new Map<number, THREE.Mesh>();

    const clock = new THREE.Clock();
    let animId: number;

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
      const delta = Math.min(clock.getDelta(), 0.1);

      controllerRef.current.update(stateRef.current, delta, () => {
        setIsHitFlashing(true);
        setTimeout(() => setIsHitFlashing(false), 200);
      });

      // Update Spaceship Position and Banking
      spaceship.position.set(stateRef.current.shipX, stateRef.current.shipY, 0);
      const roll = (stateRef.current.targetShipX - stateRef.current.shipX) * -0.3;
      const pitch = (stateRef.current.targetShipY - stateRef.current.shipY) * 0.15;
      spaceship.rotation.z = roll;
      spaceship.rotation.x = pitch;

      // Smooth star motion via single object translation (Zero CPU buffer upload)
      stars.position.z = ((stars.position.z + delta * 30) % 60);

      // Sync Asteroids
      const activeAstIds = new Set(stateRef.current.asteroids.map((a) => a.id));
      asteroidMeshMap.forEach((mesh, id) => {
        if (!activeAstIds.has(id)) {
          scene.remove(mesh);
          mesh.geometry.dispose();
          asteroidMeshMap.delete(id);
        }
      });
      stateRef.current.asteroids.forEach((a) => {
        let mesh = asteroidMeshMap.get(a.id);
        if (!mesh) {
          mesh = createAsteroidMesh(a.radius);
          scene.add(mesh);
          asteroidMeshMap.set(a.id, mesh);
        }
        mesh.position.set(a.x, a.y, a.z);
        mesh.rotation.x += a.rotX * delta;
        mesh.rotation.y += a.rotY * delta;
      });

      // Sync Orbs
      const activeOrbIds = new Set(stateRef.current.orbs.map((o) => o.id));
      orbMeshMap.forEach((mesh, id) => {
        if (!activeOrbIds.has(id)) {
          scene.remove(mesh);
          mesh.geometry.dispose();
          orbMeshMap.delete(id);
        }
      });
      stateRef.current.orbs.forEach((o) => {
        let mesh = orbMeshMap.get(o.id);
        if (!mesh) {
          mesh = createCosmicOrbMesh();
          scene.add(mesh);
          orbMeshMap.set(o.id, mesh);
        }
        mesh.position.set(o.x, o.y, o.z);
        mesh.rotation.y += delta * 4;
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
            'Distancia Cósmica': `${Math.floor(stateRef.current.distance)}km`,
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
      asteroidMeshMap.forEach((m) => {
        scene.remove(m);
        m.geometry.dispose();
      });
      orbMeshMap.forEach((m) => {
        scene.remove(m);
        m.geometry.dispose();
      });
      starGeo.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onGameOver, isFrenzyMode, onScoreUpdate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const keysToIntercept = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's', 'A', 'D', 'W', 'S', ' '];
      if (keysToIntercept.includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        controllerRef.current.steer(stateRef.current, -1.2, 0);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        controllerRef.current.steer(stateRef.current, 1.2, 0);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        controllerRef.current.steer(stateRef.current, 0, 1.0);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        controllerRef.current.steer(stateRef.current, 0, -1.0);
      }
    };
    window.addEventListener('keydown', handleKey, { capture: true, passive: false });
    return () => window.removeEventListener('keydown', handleKey, { capture: true });
  }, []);

  return (
    <div className="relative w-full h-full min-h-[460px] md:min-h-[580px] bg-slate-950 overflow-hidden select-none">
      <div ref={mountRef} className="w-full h-full absolute inset-0" />

      {isHitFlashing && (
        <div className="absolute inset-0 bg-red-600/30 pointer-events-none z-20 animate-pulse" />
      )}

      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30 pointer-events-none">
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-300 bg-slate-950/70 border border-slate-800/80 px-4 py-2 rounded-xl backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Trophy className="w-4 h-4" />
            <span className="font-mono tabular-nums text-sm text-white">{hudState.score}</span>
          </div>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span>Canicas Cósmicas:</span>
            <span className="font-mono tabular-nums text-sm text-amber-300 font-bold">{hudState.marbles}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800/80 px-3 py-2 rounded-xl backdrop-blur-md">
          {!isFrenzyMode ? (
            <div className="flex items-center gap-1">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 transition-colors ${
                    i < hudState.lives ? 'text-red-500 fill-red-500' : 'text-slate-700'
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

      {/* Helper Desktop prompt */}
      <div className="hidden md:flex absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-slate-400 bg-slate-900/60 border border-slate-800 px-3 py-1 rounded-lg pointer-events-none z-30">
        Controla el vuelo con [<kbd className="text-amber-400 font-mono">WASD</kbd>] o Flechas para esquivar asteroides
      </div>

      {/* Virtual Mobile Controller */}
      <VirtualController
        onDirection={(dir) => {
          if (dir === 'left') controllerRef.current.steer(stateRef.current, -1.2, 0);
          if (dir === 'right') controllerRef.current.steer(stateRef.current, 1.2, 0);
          if (dir === 'up') controllerRef.current.steer(stateRef.current, 0, 1.0);
          if (dir === 'down') controllerRef.current.steer(stateRef.current, 0, -1.0);
        }}
        showDpad={true}
        showAction={false}
      />
    </div>
  );
};
