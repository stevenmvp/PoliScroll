import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { type GameDefinition, type GameInstanceProps } from '../../types/game';
import { soundManager } from '../../services/soundManager';
import { academicStore } from '../../services/academicStore';
import {
  Trophy,
  CircleDot,
  Check,
  X,
  HelpCircle,
  Clock,
  Heart,
  Zap,
  Sparkles,
  Flame,
  GraduationCap,
  Grid3X3,
  Compass,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';

type TriviaMode = 'cumbre' | 'reloj' | 'tablero';

export const TriviaSuiteView: React.FC<GameInstanceProps> = ({
  onGameOver,
  onScoreUpdate,
}) => {
  const [activeMode, setActiveMode] = useState<TriviaMode>('cumbre');
  const [activeTopic, setActiveTopic] = useState(() => academicStore.getActiveTopic());

  useEffect(() => {
    return academicStore.subscribe(() => {
      setActiveTopic(academicStore.getActiveTopic());
    });
  }, []);

  // Shared pool of academic items from the active topic
  const pool = useMemo(() => {
    return academicStore.getRandomItemPool(16);
  }, [activeTopic]);

  // ==========================================
  // MODE 1: ASCENSO A LA CUMBRE (Roguelite)
  // ==========================================
  const [cumbreLevel, setCumbreLevel] = useState(1); // 1 to 10
  const [cumbreLives, setCumbreLives] = useState(3);
  const [cumbreScore, setCumbreScore] = useState(0);
  const [cumbreMarbles, setCumbreMarbles] = useState(0);
  const [chosenCard, setChosenCard] = useState<number | null>(null);
  const [wildcard5050Used, setWildcard5050Used] = useState(false);
  const [wildcardSkipUsed, setWildcardSkipUsed] = useState(false);
  const [wildcardLifeBought, setWildcardLifeBought] = useState(false);
  const [cumbreFeedback, setCumbreFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
    mistakenOrigin?: string;
  } | null>(null);

  // Cards for Level Path Selection
  const levelCategoryCards = useMemo(() => {
    return [
      { id: 1, label: 'Estructura & Definición', difficulty: 'Normal', icon: 'Book' },
      { id: 2, label: 'Identificación Rápida', difficulty: 'Media', icon: 'Zap' },
      { id: 3, label: 'Verificación Crítica', difficulty: 'Avanzada', icon: 'Shield' },
    ];
  }, []);

  // Question for current level
  const cumbreQuestion = useMemo(() => {
    const item = pool[cumbreLevel % pool.length] || pool[0];
    const isTargetCorrect = Math.random() > 0.45;
    const targetItem = isTargetCorrect
      ? (activeTopic.correctItems[cumbreLevel % activeTopic.correctItems.length] || item)
      : (activeTopic.distractorItems[cumbreLevel % activeTopic.distractorItems.length] || item);

    return {
      term: targetItem.term,
      isCorrect: isTargetCorrect,
      explanation: targetItem.explanation,
      mistakenOrigin: !isTargetCorrect ? (targetItem as any).mistakenOrigin : undefined,
    };
  }, [cumbreLevel, pool, activeTopic]);

  const handleCumbreAnswer = (userSaidYes: boolean) => {
    const isSuccess = userSaidYes === cumbreQuestion.isCorrect;
    const pts = cumbreLevel <= 3 ? 100 : cumbreLevel <= 7 ? 300 : 500;

    academicStore.recordChoice({
      gameId: 'trivia-cumbre',
      concept: cumbreQuestion.term,
      isCorrect: isSuccess,
      mistakenOrigin: cumbreQuestion.mistakenOrigin,
      quickExplanation: cumbreQuestion.explanation,
    });

    if (isSuccess) {
      soundManager.playCorrect();
      const nextScore = cumbreScore + pts;
      const nextMarbles = cumbreMarbles + Math.ceil(pts / 100);
      setCumbreScore(nextScore);
      setCumbreMarbles(nextMarbles);
      if (onScoreUpdate) onScoreUpdate(nextScore);

      setCumbreFeedback({
        isCorrect: true,
        explanation: cumbreQuestion.explanation,
      });

      setTimeout(() => {
        setCumbreFeedback(null);
        setChosenCard(null);
        if (cumbreLevel >= 10) {
          // Reached the summit!
          soundManager.playFanfare();
          confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
          onGameOver({
            score: nextScore,
            marblesEarned: nextMarbles + 15,
            won: true,
            stats: {
              'Modo': 'Ascenso a la Cumbre (Nivel 10 Completado)',
              'Vidas Restantes': `${cumbreLives} / 3`,
            },
          });
        } else {
          setCumbreLevel((prev) => prev + 1);
        }
      }, 1200);
    } else {
      soundManager.playHit();
      const remainingLives = cumbreLives - 1;
      setCumbreLives(remainingLives);

      setCumbreFeedback({
        isCorrect: false,
        explanation: cumbreQuestion.explanation,
        mistakenOrigin: cumbreQuestion.mistakenOrigin,
      });

      if (remainingLives <= 0) {
        setTimeout(() => {
          onGameOver({
            score: cumbreScore,
            marblesEarned: cumbreMarbles,
            won: false,
            stats: {
              'Modo': 'Ascenso a la Cumbre',
              'Nivel Alcanzado': `${cumbreLevel} / 10`,
            },
          });
        }, 1500);
      } else {
        setTimeout(() => {
          setCumbreFeedback(null);
          setChosenCard(null);
          setCumbreLevel((prev) => Math.min(10, prev + 1));
        }, 1500);
      }
    }
  };

  // Comodines handlers
  const handleUse5050 = () => {
    if (wildcard5050Used) return;
    setWildcard5050Used(true);
    soundManager.playClick('E4');
  };

  const handleUseSkip = () => {
    if (wildcardSkipUsed) return;
    setWildcardSkipUsed(true);
    soundManager.playClick('A4');
    setChosenCard(null);
    setCumbreLevel((prev) => Math.min(10, prev + 1));
  };

  const handleBuyLife = () => {
    if (wildcardLifeBought || cumbreLives >= 3 || cumbreScore < 300) return;
    setWildcardLifeBought(true);
    setCumbreScore((s) => s - 300);
    setCumbreLives((l) => l + 1);
    soundManager.playClick('C5');
  };

  // ==========================================
  // MODE 2: CARRERA CONTRARRELOJ (Time Attack)
  // ==========================================
  const [relojTime, setRelojTime] = useState(120); // 2 minutes continuous
  const [relojScore, setRelojScore] = useState(0);
  const [relojMarbles, setRelojMarbles] = useState(0);
  const [relojStreak, setRelojStreak] = useState(0);
  const [relojQuestionIndex, setRelojQuestionIndex] = useState(0);
  const [relojActive, setRelojActive] = useState(false);

  useEffect(() => {
    if (activeMode !== 'reloj' || !relojActive) return;
    const interval = setInterval(() => {
      setRelojTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setRelojActive(false);
          soundManager.playHit();
          onGameOver({
            score: relojScore,
            marblesEarned: relojMarbles,
            won: relojScore >= 3000,
            stats: {
              'Modo': 'Carrera Contrarreloj 2 Minutos',
              'Resultado': relojScore >= 3000 ? '¡Meta 3000 Alcanzada!' : 'Tiempo Agotado',
              'Racha Máxima': `${relojStreak}`,
            },
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeMode, relojActive, relojScore, relojMarbles, relojStreak, onGameOver]);

  const relojQuestion = useMemo(() => {
    const item = pool[relojQuestionIndex % pool.length];
    return item;
  }, [pool, relojQuestionIndex]);

  const handleRelojAnswer = (userSaidValid: boolean) => {
    if (!relojActive) return;
    const isSuccess = userSaidValid === relojQuestion.isCorrect;

    academicStore.recordChoice({
      gameId: 'trivia-reloj',
      concept: relojQuestion.term,
      isCorrect: isSuccess,
      mistakenOrigin: relojQuestion.mistakenOrigin,
      quickExplanation: relojQuestion.explanation,
    });

    if (isSuccess) {
      soundManager.playCorrect();
      const nextStreak = relojStreak + 1;
      setRelojStreak(nextStreak);

      // Multiplier x1, x2, x3
      const multiplier = nextStreak >= 10 ? 3 : nextStreak >= 5 ? 2 : 1;
      const pts = 100 * multiplier;
      const nextScore = relojScore + pts;
      setRelojScore(nextScore);
      setRelojMarbles((m) => m + multiplier);
      if (onScoreUpdate) onScoreUpdate(nextScore);

      // +10s on every 5 streak!
      if (nextStreak > 0 && nextStreak % 5 === 0) {
        setRelojTime((t) => t + 10);
        soundManager.playFanfare();
      }
    } else {
      soundManager.playHit();
      setRelojStreak(0);
      // -5s penalty on error
      setRelojTime((t) => Math.max(0, t - 5));
    }

    setRelojQuestionIndex((i) => i + 1);
  };

  // ==========================================
  // MODE 3: EL TABLERO DE EXPEDICIÓN (4x4 Matrix)
  // ==========================================
  const [boardErrors, setBoardErrors] = useState(0);
  const [boardScore, setBoardScore] = useState(0);
  const [boardMarbles, setBoardMarbles] = useState(0);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);

  // Initialize 16 cards (4x4)
  const [boardCards, setBoardCards] = useState(() => {
    return Array.from({ length: 16 }, (_, i) => {
      const item = pool[i % pool.length];
      return {
        id: i,
        row: Math.floor(i / 4),
        col: i % 4,
        term: item.term,
        isCorrect: item.isCorrect,
        explanation: item.explanation,
        mistakenOrigin: item.mistakenOrigin,
        conquered: false,
      };
    });
  });

  const handleBoardCardClick = (index: number) => {
    const card = boardCards[index];
    if (card.conquered) return;
    soundManager.playClick('C4');
    setSelectedCell(index);
  };

  const handleResolveCell = (userSaidValid: boolean) => {
    if (selectedCell === null) return;
    const card = boardCards[selectedCell];
    const isSuccess = userSaidValid === card.isCorrect;

    academicStore.recordChoice({
      gameId: 'trivia-tablero',
      concept: card.term,
      isCorrect: isSuccess,
      mistakenOrigin: card.mistakenOrigin,
      quickExplanation: card.explanation,
    });

    if (isSuccess) {
      soundManager.playCorrect();
      const updated = [...boardCards];
      updated[selectedCell] = { ...card, conquered: true };
      setBoardCards(updated);

      let pts = 150;
      let extraMarbles = 1;

      // Check row completion combo
      const rowCards = updated.filter((c) => c.row === card.row);
      const isRowComplete = rowCards.every((c) => c.conquered);
      if (isRowComplete && !card.conquered) {
        pts += 500;
        extraMarbles += 3;
        soundManager.playFanfare();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }

      // Check column completion combo
      const colCards = updated.filter((c) => c.col === card.col);
      const isColComplete = colCards.every((c) => c.conquered);
      if (isColComplete && !card.conquered) {
        pts += 500;
        extraMarbles += 3;
        soundManager.playFanfare();
      }

      // Check full board clear combo (+2000)
      const isFullBoard = updated.every((c) => c.conquered);
      if (isFullBoard) {
        pts += 2000;
        extraMarbles += 15;
        soundManager.playFanfare();
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
        setTimeout(() => {
          onGameOver({
            score: boardScore + pts,
            marblesEarned: boardMarbles + extraMarbles,
            won: true,
            stats: {
              'Modo': 'El Tablero de Expedición 4x4',
              'Resultado': '¡Tablero 100% Conquistado (+2000 pts)!',
              'Errores': `${boardErrors} / 4`,
            },
          });
        }, 1000);
      }

      const nextScore = boardScore + pts;
      const nextMarbles = boardMarbles + extraMarbles;
      setBoardScore(nextScore);
      setBoardMarbles(nextMarbles);
      if (onScoreUpdate) onScoreUpdate(nextScore);
      setSelectedCell(null);
    } else {
      soundManager.playHit();
      const nextErrors = boardErrors + 1;
      setBoardErrors(nextErrors);
      setSelectedCell(null);

      if (nextErrors >= 4) {
        onGameOver({
          score: boardScore,
          marblesEarned: boardMarbles,
          won: false,
          stats: {
            'Modo': 'El Tablero de Expedición',
            'Resultado': 'Colapso por 4 errores de criterio',
            'Casillas Conquistadas': `${boardCards.filter((c) => c.conquered).length} / 16`,
          },
        });
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 sm:p-5 select-none bg-slate-50 text-slate-900 max-w-4xl mx-auto overflow-y-auto">
      {/* Top Universal Academic Bar */}
      <div className="w-full bg-white rounded-2xl p-3 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-600">
              {activeTopic.domain.toUpperCase()} · CRITERIO VIGENTE
            </div>
            <div className="text-xs font-black text-slate-900 line-clamp-1">
              {activeTopic.promptQuestion}
            </div>
          </div>
        </div>

        {/* 3 Game Modes Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => {
              soundManager.playClick('C4');
              setActiveMode('cumbre');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'cumbre'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>1. Ascenso Cumbre</span>
          </button>
          <button
            onClick={() => {
              soundManager.playClick('E4');
              setActiveMode('reloj');
              if (!relojActive) setRelojActive(true);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'reloj'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>2. Contrarreloj</span>
          </button>
          <button
            onClick={() => {
              soundManager.playClick('G4');
              setActiveMode('tablero');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'tablero'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5 text-emerald-500" />
            <span>3. Tablero 4x4</span>
          </button>
        </div>
      </div>

      {/* Main Mode Viewport */}
      <div className="my-4 flex-1 flex flex-col justify-center">
        {/* ==================================================== */}
        {/* MODE 1: ASCENSO A LA CUMBRE (Roguelite)               */}
        {/* ==================================================== */}
        {activeMode === 'cumbre' && (
          <div className="space-y-4">
            {/* Header: Level 1-10 progress & Lives */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                  NIVEL {cumbreLevel} / 10
                </span>
                <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                  {cumbreLevel <= 3
                    ? 'Escala Inicial (+100 pts)'
                    : cumbreLevel <= 7
                    ? 'Paso Nevado (+300 pts)'
                    : 'La Cumbre (+500 pts)'}
                </span>
              </div>

              {/* Lives and Wildcards Bar */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((heart) => (
                    <Heart
                      key={heart}
                      className={`w-4 h-4 ${
                        heart <= cumbreLives
                          ? 'fill-rose-500 text-rose-500'
                          : 'fill-slate-200 text-slate-300'
                      }`}
                    />
                  ))}
                </div>

                <div className="h-4 w-px bg-slate-200" />

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleUse5050}
                    disabled={wildcard5050Used}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      wildcard5050Used
                        ? 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                    }`}
                    title="Pistas 50/50"
                  >
                    50/50
                  </button>
                  <button
                    onClick={handleUseSkip}
                    disabled={wildcardSkipUsed}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      wildcardSkipUsed
                        ? 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    }`}
                    title="Saltar pregunta"
                  >
                    Saltar
                  </button>
                  <button
                    onClick={handleBuyLife}
                    disabled={wildcardLifeBought || cumbreLives >= 3 || cumbreScore < 300}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      wildcardLifeBought || cumbreLives >= 3 || cumbreScore < 300
                        ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-60'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                    title="+1 Vida (Cuesta 300 pts)"
                  >
                    +1 Vida (300p)
                  </button>
                </div>
              </div>
            </div>

            {/* Path Selection vs Question Card */}
            {chosenCard === null ? (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm text-center">
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                  Elige tu Camino para el Nivel {cumbreLevel}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  Selecciona una de las 3 Cartas de Categoría
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                  {levelCategoryCards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => {
                        soundManager.playClick('A3');
                        setChosenCard(card.id);
                      }}
                      className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 bg-slate-50 transition-all text-left group shadow-xs hover:shadow-md"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {card.difficulty}
                      </div>
                      <div className="text-sm font-black text-slate-900 mt-1">
                        {card.label}
                      </div>
                      <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                        <span>Iniciar Camino</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600 font-bold mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Nivel {cumbreLevel} · Recompensa: +{cumbreLevel <= 3 ? 100 : cumbreLevel <= 7 ? 300 : 500} pts</span>
                </div>

                <div className="text-sm text-slate-500">¿El siguiente término pertenece genuinamente a {activeTopic.title}?</div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 my-4 tracking-tight">
                  &ldquo;{cumbreQuestion.term}&rdquo;
                </div>

                {cumbreFeedback && (
                  <div
                    className={`p-3 rounded-2xl mb-4 text-xs font-bold animate-in fade-in-0 duration-200 ${
                      cumbreFeedback.isCorrect
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{cumbreFeedback.isCorrect ? '¡ACIERTO ACADÉMICO!' : '¡RESPUESTA ERRÓNEA!'}</span>
                      {activeTopic.sources?.[0]?.title && (
                        <span className="text-[10px] font-mono opacity-80">
                          Ref: {activeTopic.sources[0].title}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-normal mt-1 leading-relaxed">{cumbreFeedback.explanation}</div>
                    {!cumbreFeedback.isCorrect && cumbreQuestion.mistakenOrigin && (
                      <div className="mt-1 text-[11px] font-semibold text-rose-700">
                        Origen Real: <span className="underline">{cumbreQuestion.mistakenOrigin}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button
                    onClick={() => handleCumbreAnswer(true)}
                    disabled={cumbreFeedback !== null}
                    className="py-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5 stroke-[3]" />
                    <span>VERDADERO (Pertenece)</span>
                  </button>
                  <button
                    onClick={() => handleCumbreAnswer(false)}
                    disabled={cumbreFeedback !== null}
                    className="py-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-rose-600 hover:bg-rose-700 text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5 stroke-[3]" />
                    <span>FALSO (Distractor)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* MODE 2: CARRERA CONTRARRELOJ (Time Attack 2 Min)     */}
        {/* ==================================================== */}
        {activeMode === 'reloj' && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-5">
            {/* Clock & Multiplier */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                <span className="font-mono text-xl font-black text-slate-900 tabular-nums">
                  {Math.floor(relojTime / 60)}:{(relojTime % 60).toString().padStart(2, '0')}
                </span>
                <span className="text-[11px] text-slate-400 font-bold hidden sm:inline">
                  (-5s error / +10s racha 5)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold">COMBO:</span>
                <span className="font-mono text-base font-black px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                  {relojStreak >= 10 ? '3x' : relojStreak >= 5 ? '2x' : '1x'}
                </span>
                <span className="text-xs text-slate-400 font-mono">({relojStreak} racha)</span>
              </div>
            </div>

            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                Meta: 3000 Puntos
              </span>
              <div className="text-sm text-slate-600 mt-1">¿Este concepto pertenece al criterio activo?</div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 my-4 tracking-tight">
                &ldquo;{relojQuestion.term}&rdquo;
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleRelojAnswer(true)}
                className="py-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>PERTENECE</span>
              </button>
              <button
                onClick={() => handleRelojAnswer(false)}
                className="py-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-rose-600 hover:bg-rose-700 text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5 stroke-[3]" />
                <span>DISTRACTOR</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* MODE 3: EL TABLERO DE EXPEDICIÓN (4x4 Matrix)        */}
        {/* ==================================================== */}
        {activeMode === 'tablero' && (
          <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Matriz 4x4:</span>
                <span>Completa filas o columnas para combos de +500 pts (+2000 tablero completo)</span>
              </div>
              <div className="flex items-center gap-1 font-mono font-bold text-rose-600">
                <span>Fallos:</span>
                <span>{boardErrors} / 4</span>
              </div>
            </div>

            {/* 4x4 Grid of Cards */}
            <div className="grid grid-cols-4 gap-2.5">
              {boardCards.map((card, idx) => (
                <button
                  key={card.id}
                  onClick={() => handleBoardCardClick(idx)}
                  className={`p-3 rounded-2xl text-center border transition-all min-h-[75px] flex flex-col items-center justify-center relative ${
                    card.conquered
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                      : selectedCell === idx
                      ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-400 text-indigo-950 scale-102'
                      : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-300 text-slate-900 hover:shadow-xs'
                  }`}
                >
                  {card.conquered ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 mb-0.5" />
                      <span className="text-[11px] font-black line-clamp-1">{card.term}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] text-slate-400 font-mono">#{idx + 1}</span>
                      <span className="text-xs font-black line-clamp-1">{card.term}</span>
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Selected Cell Modal/Banner to Resolve */}
            {selectedCell !== null && (
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 animate-in fade-in-0 duration-150">
                <div className="text-xs text-indigo-700 font-bold">
                  Casilla #{selectedCell + 1}: &ldquo;{boardCards[selectedCell].term}&rdquo;
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  ¿Es un elemento verificado del criterio: {activeTopic.title}?
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => handleResolveCell(true)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    Sí, Pertenece
                  </button>
                  <button
                    onClick={() => handleResolveCell(false)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs"
                  >
                    No, es Distractor
                  </button>
                  <button
                    onClick={() => setSelectedCell(null)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-200">
        <span>Retroalimentación socrática y registro continuo en el Cuaderno Académico</span>
        <span className="font-mono text-slate-600 font-bold">Vortex Academic Suite</span>
      </div>
    </div>
  );
};

export const TriviaSuiteGame: GameDefinition = {
  id: 'academic-trivia',
  title: 'Academic Trivia Suite',
  tagline: '3 Modos: Ascenso a la Cumbre, Carrera Contrarreloj y El Tablero 4x4',
  category: 'logic',
  dimension: '2d',
  difficulty: 'medio',
  icon: 'GraduationCap',
  color: '#8b5cf6',
  accentColor: '#a78bfa',
  unlockedByDefault: true,
  unlockCost: 0,
  instruction: 'Domina los 3 modos de trivia: Roguelite con comodines, Contrarreloj 2 min con combos, o Conquista el Tablero 4x4.',
  controlsDescription: {
    desktop: 'Click / Teclado para elegir opciones y comodines',
    mobile: 'Tocar opciones en pantalla',
  },
  article: {
    lore: 'La prueba definitiva de raciocinio estructurada en tres modalidades de alta tensión intelectual.',
    mechanics: '1. Ascenso a la Cumbre: 10 niveles roguelite y comodines. 2. Contrarreloj: 2 minutos continuos con multiplicadores de racha. 3. Tablero 4x4: Conquista de casillas y combos lineales.',
    tips: ['Usa el comodín 50/50 en los niveles 8-10 de la Cumbre', 'En Contrarreloj cada 5 aciertos suman +10s al reloj'],
  },
  Component: TriviaSuiteView,
};
