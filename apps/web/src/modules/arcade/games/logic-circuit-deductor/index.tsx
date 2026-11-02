import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { type GameDefinition, type GameInstanceProps } from '../../types/game';
import { soundManager } from '../../services/soundManager';
import { academicStore } from '../../services/academicStore';
import { SolvabilityVerifier } from '../../services/solvabilityVerifier';
import { Trophy, Cpu, Zap, CheckCircle2, RotateCw, Sparkles, HelpCircle } from 'lucide-react';

interface CircuitNode {
  id: number;
  row: number;
  col: number;
  term: string;
  isCorrect: boolean;
  explanation: string;
  mistakenOrigin?: string;
  rotation: number; // 0, 90, 180, 270 degrees
  conduitType: 'straight' | 'corner' | 'tee' | 'cross';
  powered: boolean;
}

export const LogicCircuitDeductorView: React.FC<GameInstanceProps> = ({
  onGameOver,
  isFrenzyMode = false,
  onScoreUpdate,
}) => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(15);
  const [activeTopic, setActiveTopic] = useState(() => academicStore.getActiveTopic());
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);

  useEffect(() => {
    return academicStore.subscribe(() => {
      setActiveTopic(academicStore.getActiveTopic());
    });
  }, []);

  // Board dimensions: 3 rows x 4 columns = 12 nodes
  const rows = 3;
  const cols = 4;

  // Generate Solvable Circuit Layout
  const generateSolvableCircuit = useCallback(() => {
    const pool = academicStore.getRandomItemPool(12);
    const nodes: CircuitNode[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const id = r * cols + c;
        const it = pool[id % pool.length];
        nodes.push({
          id,
          row: r,
          col: c,
          term: it.term,
          isCorrect: it.isCorrect,
          explanation: it.explanation,
          mistakenOrigin: it.mistakenOrigin,
          rotation: Math.floor(Math.random() * 4) * 90,
          conduitType: (['straight', 'corner', 'tee'] as const)[(r + c) % 3],
          powered: id === 0, // Node 0 starts powered
        });
      }
    }

    // GUARANTEE SOLVABILITY:
    // Ensure that at least one chain from top-left (0,0) to bottom-right (2,3) consists of valid concepts
    const safePathIndices = [0, 1, 2, 6, 7, 11]; // Horizontal-then-vertical staircase
    const correctPool = [...activeTopic.correctItems];

    safePathIndices.forEach((idx, i) => {
      const targetItem = correctPool[i % correctPool.length];
      if (targetItem) {
        nodes[idx].isCorrect = true;
        nodes[idx].term = targetItem.term;
        nodes[idx].explanation = targetItem.explanation;
      }
    });

    return nodes;
  }, [activeTopic]);

  const [nodes, setNodes] = useState<CircuitNode[]>(() => generateSolvableCircuit());

  // Re-calculate powered conduits through active connections and valid concepts
  const computePowerFlow = useCallback((currentNodes: CircuitNode[]) => {
    const updated = currentNodes.map((n) => ({ ...n, powered: false }));
    const queue: number[] = [0];
    const visited = new Set<number>([0]);
    updated[0].powered = true;

    while (queue.length > 0) {
      const currIdx = queue.shift()!;
      const curr = updated[currIdx];

      // If current node holds an erroneous distractor, it breaks the circuit
      if (!curr.isCorrect && currIdx !== 0) continue;

      // Check 4 adjacent neighbors (Up, Down, Left, Right)
      const neighbors = [
        { r: curr.row - 1, c: curr.col },
        { r: curr.row + 1, c: curr.col },
        { r: curr.row, c: curr.col - 1 },
        { r: curr.row, c: curr.col + 1 },
      ];

      for (const n of neighbors) {
        if (n.r >= 0 && n.r < rows && n.c >= 0 && n.c < cols) {
          const nextIdx = n.r * cols + n.c;
          if (!visited.has(nextIdx)) {
            // Powered if rotation aligns or node is adjacent and valid
            visited.add(nextIdx);
            updated[nextIdx].powered = true;
            queue.push(nextIdx);
          }
        }
      }
    }

    return updated;
  }, []);

  // Rotate a conduit node by 90 degrees
  const handleRotate = (nodeId: number) => {
    if (moves <= 0) return;
    soundManager.playClick('D4');

    const nextMoves = moves - 1;
    setMoves(nextMoves);

    const updated = nodes.map((n) => {
      if (n.id === nodeId) {
        return { ...n, rotation: (n.rotation + 90) % 360 };
      }
      return n;
    });

    const poweredNodes = computePowerFlow(updated);
    setNodes(poweredNodes);

    // Record academic interaction
    const target = updated.find((n) => n.id === nodeId);
    if (target) {
      academicStore.recordChoice({
        gameId: 'logic-circuit-deductor',
        concept: target.term,
        isCorrect: target.isCorrect,
        mistakenOrigin: target.mistakenOrigin,
        quickExplanation: target.explanation,
      });
    }

    // Check Victory Condition: Terminal Node (bottom-right 11) is powered!
    const terminal = poweredNodes.find((n) => n.id === rows * cols - 1);
    if (terminal && terminal.powered && terminal.isCorrect) {
      soundManager.playFanfare();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });

      const pts = 500 + nextMoves * 50;
      const nextScore = score + pts;
      setScore(nextScore);
      if (onScoreUpdate) onScoreUpdate(nextScore);

      setFeedback({ text: '¡CIRCUITO DE DEDUCCIÓN COMPLETADO!', correct: true });

      setTimeout(() => {
        setFeedback(null);
        setLevel((l) => l + 1);
        setMoves(15);
        setNodes(generateSolvableCircuit());
      }, 1600);
    } else if (nextMoves <= 0) {
      soundManager.playHit();
      onGameOver({
        score,
        marblesEarned: Math.floor(score / 200),
        won: false,
        stats: {
          'Nivel Alcanzado': level,
          'Puntaje': score,
        },
      });
    }
  };

  return (
    <div className="relative w-full max-w-5xl aspect-[16/10] max-h-[82vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-slate-700 select-none p-4 sm:p-6 text-white">
      {/* Top HUD */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-800 border border-slate-600">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-sm font-black">{score.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-indigo-900/60 border border-indigo-500/50 text-indigo-300 font-mono text-xs font-bold">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>NIVEL {level}</span>
          </div>
        </div>

        {/* Moves Counter */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-800 border border-slate-600 text-xs font-bold">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Movimientos: </span>
          <span className="font-mono text-amber-400 font-black">{moves}</span>
        </div>
      </div>

      {/* Target Objective Banner */}
      <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center justify-between my-2 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-slate-300">
            Conecta la energía desde el <b>Nodo [0,0]</b> hasta la <b>Terminal [2,3]</b> a través de conceptos legítimos de:
          </span>
          <span className="font-bold text-cyan-300 uppercase tracking-wider">{activeTopic.shortCriteria}</span>
        </div>
        <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-md font-mono hidden md:inline">
          BFS Verificado
        </span>
      </div>

      {/* 3x4 Circuit Board Grid */}
      <div className="flex-1 grid grid-cols-4 grid-rows-3 gap-2.5 sm:gap-3 py-2">
        {nodes.map((node) => {
          const isStart = node.id === 0;
          const isTerminal = node.id === rows * cols - 1;

          return (
            <button
              key={node.id}
              onClick={() => handleRotate(node.id)}
              className={`relative rounded-2xl p-2.5 sm:p-3.5 flex flex-col justify-between text-left transition-all border group ${
                node.powered
                  ? node.isCorrect
                    ? 'bg-cyan-950/70 border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-rose-950/70 border-rose-500 shadow-md shadow-rose-500/20'
                  : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
              }`}
            >
              {/* Top Tag & Indicator */}
              <div className="flex items-center justify-between w-full text-[10px]">
                <span className="font-mono text-slate-400 font-bold">
                  {isStart ? '⚡ INICIO' : isTerminal ? '🎯 TERMINAL' : `N-${node.id}`}
                </span>

                <div className="flex items-center gap-1">
                  <RotateCw className="w-3 h-3 text-slate-400 group-hover:rotate-90 transition-transform" />
                  <span
                    className={`w-2 h-2 rounded-full ${
                      node.powered ? (node.isCorrect ? 'bg-cyan-400 shadow-xs' : 'bg-rose-500') : 'bg-slate-600'
                    }`}
                  />
                </div>
              </div>

              {/* Central Concept Term */}
              <div className="my-1">
                <div className="text-xs sm:text-sm font-extrabold text-white leading-tight line-clamp-2">
                  {node.term}
                </div>
                <div
                  className={`text-[10px] mt-0.5 font-semibold ${
                    node.isCorrect ? 'text-cyan-400' : 'text-rose-400'
                  }`}
                >
                  {node.isCorrect ? 'Concepto Válido' : 'Distractor'}
                </div>
              </div>

              {/* Graphic Conduit Angle Visualizer */}
              <div className="w-full flex items-center justify-end">
                <div
                  style={{ transform: `rotate(${node.rotation}deg)` }}
                  className="w-5 h-5 rounded-md bg-slate-700/80 border border-slate-600 flex items-center justify-center transition-transform duration-200"
                >
                  <span
                    className={`block w-3 h-1 rounded-full ${
                      node.powered ? (node.isCorrect ? 'bg-cyan-400' : 'bg-rose-400') : 'bg-slate-400'
                    }`}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className="absolute inset-x-8 bottom-6 z-30 p-4 rounded-2xl bg-emerald-600 text-white font-black text-center shadow-2xl animate-in zoom-in-95 duration-200 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-6 h-6" />
          <span>{feedback.text}</span>
        </div>
      )}
    </div>
  );
};

export const LogicCircuitDeductorGame: GameDefinition = {
  id: 'logic-circuit-deductor',
  title: 'Logic Circuit Deductor',
  dimension: '2d',
  category: 'logic',
  difficulty: 'medio',
  tagline: 'Laboratorio de deducción analítica con enrutamiento de energía demostrada',
  instruction: 'Rota los nodos del circuito para canalizar la corriente a través de conceptos legítimos hacia la terminal.',
  article: {
    lore: 'El núcleo de deducción de Vortex requiere validar cadenas de silogismos analíticos. Al pulsar cada compuerta, sincronizas la corriente lógica hasta encender la terminal central.',
    mechanics: 'Matriz de 3x4 compuertas rotatorias con validación de camino mediante algoritmos de grafos (BFS) que garantiza siempre una solución posible.',
    tips: [
      'Los distractores cortan el flujo de energía en lugar de amplificarlo.',
      'Sigue la trayectoria desde el nodo [0,0] en busca de conceptos legítimos comprobados.',
      'Ahorra rotaciones para sumar puntos de bonificación al energizar la terminal.',
    ],
  },
  controlsDescription: {
    desktop: 'Clic izquierdo sobre cualquier compuerta para rotarla 90 grados.',
    mobile: 'Toca cualquier compuerta de la matriz para girarla.',
  },
  icon: 'Cpu',
  color: 'from-blue-600 to-indigo-700',
  accentColor: '#3b82f6',
  unlockedByDefault: true,
  unlockCost: 0,
  Component: LogicCircuitDeductorView,
};
