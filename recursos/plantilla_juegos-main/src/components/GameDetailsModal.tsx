import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { type GameDefinition } from '../types/game';
import { X, Play, Cpu, Music, Box, CheckCircle2 } from 'lucide-react';
import { createCyberHovercraft } from '../games/cyber-runner-3d/assets';
import { createProceduralSpaceship } from '../games/asteroid-drift-3d/assets';

interface GameDetailsModalProps {
  game: GameDefinition;
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
  isUnlocked: boolean;
  onUnlock?: () => void;
}

export const GameDetailsModal: React.FC<GameDetailsModalProps> = ({
  game,
  isOpen,
  onClose,
  onPlay,
  isUnlocked,
  onUnlock,
}) => {
  const modelPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !modelPreviewRef.current) return;
    const container = modelPreviewRef.current;

    // Mini 3D Inspector scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 1.8, 4.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const light1 = new THREE.DirectionalLight(0xffffff, 1.5);
    light1.position.set(4, 6, 4);
    scene.add(light1);

    const ambient = new THREE.AmbientLight(0x818cf8, 0.8);
    scene.add(ambient);

    let subject: THREE.Object3D;
    if (game.id === 'cyber-runner-3d') {
      subject = createCyberHovercraft();
    } else if (game.id === 'asteroid-drift-3d') {
      subject = createProceduralSpaceship();
    } else {
      // 2D games: show procedural geometric cyber-orb
      const geo = new THREE.IcosahedronGeometry(1.0, 1);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        wireframe: true,
        emissive: 0x6366f1,
        emissiveIntensity: 0.4,
      });
      subject = new THREE.Mesh(geo, mat);
    }
    scene.add(subject);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      subject.rotation.y += 0.015;
      subject.rotation.x = Math.sin(Date.now() * 0.001) * 0.2;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [isOpen, game]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
          <span className="font-mono text-violet-600 uppercase font-bold">{game.dimension}</span>
          <span aria-hidden="true">·</span>
          <span>Categoría: {game.category.toUpperCase()}</span>
          <span aria-hidden="true">·</span>
          <span className="text-amber-700 font-bold capitalize">Dificultad {game.difficulty}</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{game.title}</h2>
        <p className="text-slate-600 text-sm mt-1">{game.tagline}</p>

        {/* 3D / 2D Model Inspector Window */}
        <div className="mt-5 rounded-2xl overflow-hidden border border-slate-200 relative bg-slate-950">
          <div ref={modelPreviewRef} className="w-full h-44" />
          <div className="absolute top-2 left-3 text-[11px] font-mono text-slate-300 bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-slate-800">
            Inspector de Modelo Procedural (Three.js / SVG)
          </div>
        </div>

        {/* Technical Architecture Breakdown */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-violet-700 mb-1">
              <Box className="w-4 h-4" />
              <span>Modelo &amp; Gráficos</span>
            </div>
            <p className="text-[12px] text-slate-600 leading-relaxed font-normal">
              {game.dimension === '3d'
                ? 'Malla 3D Three.js PBR con materiales estándar y sombras en tiempo real.'
                : 'Lienzo HTML5 Canvas con renderizado vectorial matemático de alta densidad.'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-violet-700 mb-1">
              <Music className="w-4 h-4" />
              <span>Audio Interactivo</span>
            </div>
            <p className="text-[12px] text-slate-600 leading-relaxed font-normal">
              Síntesis nativa en Tone.js (osciladores, modulación FM y arpegios chiptune a 60 FPS).
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-violet-700 mb-1">
              <Cpu className="w-4 h-4" />
              <span>Arquitectura MVC</span>
            </div>
            <p className="text-[12px] text-slate-600 leading-relaxed font-normal">
              Encapsulado en carpeta propia con separación estricta de Model, View, Controller y Audio.
            </p>
          </div>
        </div>

        {/* Lore & Mechanics */}
        <div className="mt-5 space-y-3">
          <div className="text-xs text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-900">Historia / Lore: </span>
            {game.article.lore}
          </div>
          <div className="text-xs text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-900">Mecánica de juego: </span>
            {game.article.mechanics}
          </div>

          <div className="pt-2">
            <div className="text-xs font-bold text-slate-700 mb-1.5">Consejos del desarrollador:</div>
            <ul className="space-y-1">
              {game.article.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Controls Guide */}
        <div className="mt-5 p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row gap-3 text-xs">
          <div className="flex-1">
            <span className="font-bold text-slate-900">Teclado PC: </span>
            <span className="text-slate-600 font-mono">{game.controlsDescription.desktop}</span>
          </div>
          <div className="flex-1">
            <span className="font-bold text-slate-900">Pantalla Táctil: </span>
            <span className="text-slate-600 font-mono">{game.controlsDescription.mobile}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            Cerrar
          </button>

          {isUnlocked ? (
            <button
              onClick={() => {
                onClose();
                onPlay();
              }}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-xs flex items-center gap-2 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Jugar Ahora</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (onUnlock) onUnlock();
              }}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 shadow-xs flex items-center gap-2 active:scale-95 transition-all"
            >
              <span>Desbloquear ({game.unlockCost} Canicas)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
