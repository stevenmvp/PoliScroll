import React, { useState, useEffect, useRef } from 'react';
import {
  academicStore,
  PRESET_TOPICS,
} from '../services/academicStore';
import {
  type AcademicTopic,
  type AcademicLogEntry,
  type AcademicStats,
} from '../types/academic';
import { soundManager } from '../services/soundManager';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  PlusCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Flame,
  Award,
  Layers,
  X,
} from 'lucide-react';

interface AcademicFeedbackDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcademicFeedbackDrawer: React.FC<AcademicFeedbackDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTopic, setActiveTopic] = useState<AcademicTopic>(() => academicStore.getActiveTopic());
  const [allTopics, setAllTopics] = useState<AcademicTopic[]>(() => academicStore.getAllTopics());
  const [logs, setLogs] = useState<AcademicLogEntry[]>(() => academicStore.getLogs());
  const [stats, setStats] = useState<AcademicStats>(() => academicStore.getStats());

  // Topic creation state
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);

  // Expanded explanations state: map logId -> loading boolean
  const [loadingExplanation, setLoadingExplanation] = useState<{ [logId: string]: boolean }>({});
  const [expandedExplanationLogs, setExpandedExplanationLogs] = useState<{ [logId: string]: boolean }>({});

  // Active chat session state
  const [activeChatLog, setActiveChatLog] = useState<AcademicLogEntry | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Filter logs: 'all' | 'mistakes' | 'correct'
  const [filterMode, setFilterMode] = useState<'all' | 'mistakes' | 'correct'>('all');

  useEffect(() => {
    return academicStore.subscribe(() => {
      setActiveTopic(academicStore.getActiveTopic());
      setAllTopics(academicStore.getAllTopics());
      setLogs(academicStore.getLogs());
      setStats(academicStore.getStats());
    });
  }, []);

  useEffect(() => {
    if (activeChatLog) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChatLog?.chatHistory, isChatSending]);

  if (!isOpen) return null;

  // Handle generating custom topic via Gemini backend
  const handleGenerateCustomTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setIsGeneratingTopic(true);
    soundManager.playClick('D4');

    try {
      const res = await fetch('/api/academic/generate-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: customPrompt.trim() }),
      });

      if (!res.ok) throw new Error('Error al conectar con la IA');
      const topicData = await res.json();
      academicStore.addCustomTopic(topicData);
      setCustomPrompt('');
      setIsCreatingTopic(false);
      soundManager.playMarbleCollect(2);
    } catch (err) {
      console.error(err);
      // Fallback topic creation if server fails
      const fallbackTopic: AcademicTopic = {
        id: `custom-${Date.now()}`,
        title: customPrompt.trim(),
        domain: 'custom',
        icon: 'BookOpen',
        promptQuestion: `¿Cuáles conceptos corresponden verdaderamente a "${customPrompt}"?`,
        shortCriteria: customPrompt.trim(),
        description: `Módulo académico sobre ${customPrompt}.`,
        correctItems: [
          { term: `Concepto Clave (${customPrompt})`, explanation: `Definición esencial y confirmada del tema.` },
          { term: `Elemento Comprobado`, explanation: `Elemento central del campo.` },
        ],
        distractorItems: [
          { term: 'Distractor Común', explanation: 'Concepto erróneo de otro campo.', mistakenOrigin: 'Confusión común' },
        ],
        isCustom: true,
      };
      academicStore.addCustomTopic(fallbackTopic);
      setCustomPrompt('');
      setIsCreatingTopic(false);
    } finally {
      setIsGeneratingTopic(false);
    }
  };

  // Handle expanding explanation with Gemini
  const handleExpandExplanation = async (log: AcademicLogEntry) => {
    if (log.detailedExplanation) {
      setExpandedExplanationLogs((prev) => ({ ...prev, [log.id]: !prev[log.id] }));
      return;
    }

    setLoadingExplanation((prev) => ({ ...prev, [log.id]: true }));
    soundManager.playClick('F4');

    try {
      const res = await fetch('/api/academic/expand-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: log.concept,
          isCorrect: log.isCorrect,
          topicTitle: log.topicTitle,
          mistakenOrigin: log.mistakenOrigin,
          questionPrompt: activeTopic.promptQuestion,
          domainCategory: activeTopic.domainCategory,
        }),
      });

      if (!res.ok) throw new Error('Error al expandir explicación');
      const data = await res.json();
      academicStore.updateDetailedExplanation(log.id, data.explanation);
      setExpandedExplanationLogs((prev) => ({ ...prev, [log.id]: true }));
      soundManager.playClick('A4');
    } catch (err) {
      console.error(err);
      academicStore.updateDetailedExplanation(
        log.id,
        `### Detalle sobre **${log.concept}**\n\n` +
          `${log.isCorrect ? '✅ Respuesta correcta' : '❌ Distractor'}. ` +
          (log.mistakenOrigin ? `Proviene de **${log.mistakenOrigin}**.` : '') +
          `\n\n${log.quickExplanation}`
      );
      setExpandedExplanationLogs((prev) => ({ ...prev, [log.id]: true }));
    } finally {
      setLoadingExplanation((prev) => ({ ...prev, [log.id]: false }));
    }
  };

  // Open Chat with AI Tutor
  const handleOpenChat = (log: AcademicLogEntry) => {
    soundManager.playClick('C5');
    setActiveChatLog(log);

    // If chat is empty, send initial warm welcoming message from model
    if (!log.chatHistory || log.chatHistory.length === 0) {
      const welcome = log.isCorrect
        ? `¡Hola! Veo que acertaste con **${log.concept}** en el tema de *${log.topicTitle}*. ¿Qué aspecto te gustaría profundizar más?`
        : `¡Hola! Noté que tuviste un tropiezo con **${log.concept}**. ${
            log.mistakenOrigin
              ? `Es muy común confundirlo porque tiene presencia en ${log.mistakenOrigin}.`
              : 'Es un distractor engañoso.'
          } ¿Te gustaría que te dé una regla mnemotécnica o analogía para recordarlo siempre?`;

      academicStore.appendChatMessage(log.id, { role: 'model', text: welcome });
    }
  };

  // Send message in AI Tutor chat
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatLog || isChatSending) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    soundManager.playClick('E4');

    // Append user message
    academicStore.appendChatMessage(activeChatLog.id, { role: 'user', text: userMsg });

    // Update activeChatLog reference
    const updatedLog = academicStore.getLogs().find((l) => l.id === activeChatLog.id);
    if (updatedLog) setActiveChatLog(updatedLog);

    setIsChatSending(true);

    try {
      const res = await fetch('/api/academic/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: updatedLog?.chatHistory || [],
          concept: activeChatLog.concept,
          topicTitle: activeChatLog.topicTitle,
          isCorrect: activeChatLog.isCorrect,
          mistakenOrigin: activeChatLog.mistakenOrigin,
          domainCategory: activeTopic.domainCategory,
        }),
      });

      if (!res.ok) throw new Error('Error en el chat');
      const data = await res.json();
      academicStore.appendChatMessage(activeChatLog.id, { role: 'model', text: data.reply });

      const finalLog = academicStore.getLogs().find((l) => l.id === activeChatLog.id);
      if (finalLog) setActiveChatLog(finalLog);
      soundManager.playClick('G4');
    } catch (err) {
      console.error(err);
      academicStore.appendChatMessage(activeChatLog.id, {
        role: 'model',
        text: `Lo siento, hubo un problema de conexión con el tutor. Recuerda que para dominar **${activeChatLog.concept}**, la clave es asociarlo con su función principal en ${activeChatLog.topicTitle}.`,
      });
    } finally {
      setIsChatSending(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    if (filterMode === 'mistakes') return !l.isCorrect;
    if (filterMode === 'correct') return l.isCorrect;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 leading-tight">
                  Cuaderno Académico &amp; Feedback
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  IA Socrática
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Análisis de raciocinio, desglose de errores y tutor interactivo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Cerrar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Topic Selector & Stats Section */}
        <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 shrink-0 space-y-3">
          {/* Active Topic Banner & Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Tema Activo:
                </span>
                {activeTopic.domainCategoryLabel && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      activeTopic.domainCategory === 'pop_culture'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : activeTopic.domainCategory === 'local_context'
                        ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                        : activeTopic.domainCategory === 'academia'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {activeTopic.domainCategoryLabel}
                  </span>
                )}
              </div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                {activeTopic.title}
              </div>
              <div className="text-xs text-indigo-600 font-medium">
                {activeTopic.promptQuestion}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={activeTopic.id}
                onChange={(e) => academicStore.setActiveTopic(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {allTopics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsCreatingTopic((prev) => !prev)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nuevo Tema IA</span>
              </button>
            </div>
          </div>

          {/* Create Topic Form (Collapsible with Domain Router & Quick Suggestions) */}
          {isCreatingTopic && (
            <form onSubmit={handleGenerateCustomTopic} className="p-3.5 bg-white border border-indigo-200 rounded-2xl shadow-xs space-y-2.5 animate-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  Ingresa cualquier tema o materia (El router clasificará automáticamente las fuentes permitidas):
                </label>
                <span className="text-[10px] font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  Router + Guardrails
                </span>
              </div>

              {/* Quick suggestion pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-medium">Sugerencias:</span>
                {[
                  { label: '🎮 League of Legends', prompt: 'League of Legends' },
                  { label: '🚍 TransMilenio Bogotá', prompt: 'TransMilenio Bogotá' },
                  { label: '🧠 Neurobiología', prompt: 'Neurobiología y Sinapsis' },
                  { label: '⚛️ Mecánica Cuántica', prompt: 'Mecánica Cuántica' },
                ].map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomPrompt(sug.prompt)}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 transition-colors"
                  >
                    {sug.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ej: League of Legends, TransMilenio, Pokémon, Húmero, Mitología..."
                  className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  disabled={isGeneratingTopic}
                />
                <button
                  type="submit"
                  disabled={isGeneratingTopic || !customPrompt.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {isGeneratingTopic ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generar</span>
                    </>
                  )}
                </button>
              </div>

              {isGeneratingTopic && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 animate-pulse">
                  <Search className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                  <span className="font-semibold text-[11px] leading-tight">
                    Enrutando a fuentes permitidas (sin mezclas absurdas)... Validando coherencia y generando parámetros para los juegos.
                  </span>
                </div>
              )}
            </form>
          )}

          {/* Verified Sources & Bibliography Accordion */}
          {activeTopic.sources && activeTopic.sources.length > 0 && (
            <div className="p-3 bg-white border border-indigo-100 rounded-2xl shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-700 uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Fuentes Permitidas &amp; Documentación ({activeTopic.sources.length})</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Fuentes del Dominio
                </span>
              </div>
              <div className="flex flex-col gap-1.5 pt-1">
                {activeTopic.sources.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                    <div className="min-w-0 mr-2 flex items-center gap-1.5">
                      {s.sourceDomain && (
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 shrink-0">
                          {s.sourceDomain}
                        </span>
                      )}
                      <span className="font-medium truncate" title={s.title}>{s.title}</span>
                    </div>
                    {s.url && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-[11px] font-bold shrink-0"
                      >
                        <span>Ver Fuente</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Mastery Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Precisión</div>
              <div className="text-base font-black text-slate-900 font-mono">
                {stats.accuracyRate}%
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Aciertos / Total</div>
              <div className="text-base font-black text-emerald-600 font-mono">
                {stats.correctCount} <span className="text-slate-300 font-normal">/ {stats.totalInteractions}</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Racha Activa</div>
              <div className="text-base font-black text-amber-500 font-mono flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{stats.currentStreak}</span>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterMode('all')}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  filterMode === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Todas ({logs.length})
              </button>
              <button
                onClick={() => setFilterMode('mistakes')}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
                  filterMode === 'mistakes'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Errores ({stats.incorrectCount})</span>
              </button>
              <button
                onClick={() => setFilterMode('correct')}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
                  filterMode === 'correct'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Aciertos ({stats.correctCount})</span>
              </button>
            </div>

            {logs.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('¿Deseas reiniciar el historial de respuestas?')) {
                    academicStore.clearLogs();
                  }
                }}
                className="text-[11px] text-slate-400 hover:text-slate-600 font-medium"
              >
                Limpiar Historial
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Feedback Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-100/50">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {filterMode === 'mistakes' ? '¡Sin errores registrados!' : 'Aún no has interactuado con ningún concepto'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Juega en Frogger Cyber Rush, Trivia Suite o en cualquier minijuego. Tus elecciones de conceptos y distractores aparecerán aquí con análisis socrático.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isExpanded = !!expandedExplanationLogs[log.id];
              const isLoading = !!loadingExplanation[log.id];

              return (
                <div
                  key={log.id}
                  className={`bg-white border rounded-2xl p-4 shadow-xs transition-all ${
                    log.isCorrect ? 'border-emerald-200/90' : 'border-red-200/90'
                  }`}
                >
                  {/* Top Item Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="mt-0.5 shrink-0">
                        {log.isCorrect ? (
                          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                            <XCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-extrabold text-slate-900">
                            {log.concept}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                              log.isCorrect
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {log.isCorrect ? 'Respuesta Correcta' : 'Distractor'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            en {log.gameId === 'frogger-rush' ? 'Frogger Rush' : log.gameId}
                          </span>
                        </div>

                        {/* Origin note if distractor */}
                        {!log.isCorrect && log.mistakenOrigin && (
                          <div className="text-xs font-semibold text-red-700 mt-0.5 flex items-center gap-1">
                            <span>Origen real:</span>
                            <span className="bg-red-50 px-1.5 py-0.5 rounded border border-red-200 font-mono text-[11px]">
                              {log.mistakenOrigin}
                            </span>
                          </div>
                        )}

                        {/* Quick concise explanation */}
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          {log.quickExplanation}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Deep Detailed Explanation Box (When Expanded) */}
                  {isExpanded && log.detailedExplanation && (
                    <div className="mt-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2 animate-in fade-in duration-150">
                      <div className="flex items-center gap-1.5 text-indigo-700 font-bold uppercase tracking-wider text-[10px]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Desglose Detallado con IA Grounded</span>
                      </div>
                      <div className="whitespace-pre-line text-slate-700 text-xs font-normal">
                        {log.detailedExplanation}
                      </div>
                    </div>
                  )}

                  {/* 2 Interactive Buttons per Item requested by user */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    {/* Botón 1: Ampliar Explicación / Detallar */}
                    <button
                      onClick={() => handleExpandExplanation(log)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                          <span>Analizando...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{isExpanded ? 'Ocultar Detalle' : 'Ampliar Explicación'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </>
                      )}
                    </button>

                    {/* Botón 2: Explicar / Conversar con la IA */}
                    <button
                      onClick={() => handleOpenChat(log)}
                      className="flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 rounded-xl shadow-xs transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Explicar / Conversar</span>
                      {log.chatHistory && log.chatHistory.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* AI Tutor Interactive Chat Sliding Session Modal/Sheet */}
        {activeChatLog && (
          <div className="border-t border-slate-200 bg-white p-4 shadow-xl flex flex-col max-h-[50%] h-[340px] shrink-0 animate-in slide-in-from-bottom duration-200">
            {/* Chat Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>Tutor IA: Conversación sobre</span>
                    <span className="text-indigo-600 font-mono">{activeChatLog.concept}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Tema: {activeChatLog.topicTitle}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveChatLog(null)}
                className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100"
              >
                Cerrar Chat
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 text-xs">
              {activeChatLog.chatHistory?.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatSending && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-2xl rounded-bl-none px-3.5 py-2 text-slate-500 flex items-center gap-1.5 border border-slate-200">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    <span>El tutor está pensando...</span>
                  </div>
                </div>
              )}
              <div ref={chatMessagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendChatMessage} className="pt-2 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Pregúntale al tutor sobre ${activeChatLog.concept}...`}
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
                disabled={isChatSending}
              />
              <button
                type="submit"
                disabled={isChatSending || !chatInput.trim()}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-colors shadow-xs"
                title="Enviar mensaje"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
