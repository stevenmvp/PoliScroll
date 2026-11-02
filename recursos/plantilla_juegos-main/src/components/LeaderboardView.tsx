import React, { useState, useEffect } from 'react';
import { progressionStore } from '../services/progressionStore';
import { type LeaderboardEntry } from '../types/game';
import { Trophy, Medal, Globe, Flame, User } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(progressionStore.getLeaderboard());
  const [progression, setProgression] = useState(progressionStore.getData());

  useEffect(() => {
    return progressionStore.subscribe(() => {
      setEntries(progressionStore.getLeaderboard());
      setProgression(progressionStore.getData());
    });
  }, []);

  const top3 = entries.slice(0, 3);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-8 select-none">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 mb-2">
          <Globe className="w-3.5 h-3.5" />
          <span>TABLA DE CLASIFICACIÓN GLOBAL EN TIEMPO REAL</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Salón de la Fama Arcade
        </h1>
        <p className="mt-2 text-xs md:text-sm text-slate-600 leading-relaxed font-normal">
          Puntuaciones mundiales sincronizadas en vivo de todos los contendientes del Modo Frenesí y desafíos libres.
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 items-end">
        {/* 2nd Place */}
        {top3[1] && (
          <div className="order-2 md:order-1 bg-white border border-slate-200 rounded-3xl p-5 text-center flex flex-col items-center shadow-xs relative">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-sm mb-3">
              <Medal className="w-5 h-5 text-slate-500" />
            </div>
            <div className="text-xs text-slate-500 font-mono font-bold">2º LUGAR</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">{top3[1].playerName}</div>
            <div className="text-xs text-slate-500 font-medium">{top3[1].country} · {top3[1].timestamp}</div>
            <div className="mt-3 text-2xl font-black font-mono tabular-nums text-slate-800">
              {top3[1].score}
            </div>
          </div>
        )}

        {/* 1st Place (Gold Champion) */}
        {top3[0] && (
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50/70 to-white border-2 border-amber-300 rounded-3xl p-6 text-center flex flex-col items-center shadow-sm relative md:-translate-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 font-bold flex items-center justify-center text-base mb-3 shadow-xs">
              <Trophy className="w-7 h-7 text-amber-600" />
            </div>
            <div className="text-xs text-amber-800 font-mono font-extrabold tracking-wider">¡LÍDER MUNDIAL!</div>
            <div className="text-xl font-black text-slate-900 mt-1">{top3[0].playerName}</div>
            <div className="text-xs text-slate-500 font-medium">{top3[0].country} · {top3[0].timestamp}</div>
            <div className="mt-4 text-3xl font-black font-mono tabular-nums text-amber-700">
              {top3[0].score}
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {top3[2] && (
          <div className="order-3 bg-white border border-slate-200 rounded-3xl p-5 text-center flex flex-col items-center shadow-xs relative">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center text-sm mb-3">
              <Medal className="w-5 h-5 text-amber-700" />
            </div>
            <div className="text-xs text-slate-500 font-mono font-bold">3º LUGAR</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">{top3[2].playerName}</div>
            <div className="text-xs text-slate-500 font-medium">{top3[2].country} · {top3[2].timestamp}</div>
            <div className="mt-3 text-2xl font-black font-mono tabular-nums text-amber-800">
              {top3[2].score}
            </div>
          </div>
        )}
      </div>

      {/* User's Best Record Banner */}
      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-violet-800 font-bold">Tu Perfil de Jugador</div>
            <div className="text-sm font-black text-slate-900">{progression.playerName}</div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-slate-600 font-medium">Mejor Puntuación Frenesí: </span>
            <span className="font-mono text-violet-700 font-black text-sm tabular-nums">
              {progression.frenzyBestScore} pts
            </span>
          </div>
          <div>
            <span className="text-slate-600 font-medium">Racha Récord: </span>
            <span className="font-mono text-violet-700 font-black text-sm tabular-nums">
              {progression.frenzyBestStreak} juegos
            </span>
          </div>
        </div>
      </div>

      {/* Leaderboard Table (Clean tabular typography, anti-slop) */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
          <span>TABLA COMPLETA</span>
          <span className="font-mono text-emerald-700 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-emerald-600" />
            <span>Actualización en vivo</span>
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {entries.map((entry, idx) => {
            const isUser = entry.playerName === progression.playerName;

            return (
              <div
                key={entry.id}
                className={`px-6 py-3.5 flex items-center justify-between transition-colors ${
                  isUser ? 'bg-violet-50/70 font-semibold' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono tabular-nums text-xs font-bold text-slate-400 w-6">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="text-sm text-slate-900 font-bold flex items-center gap-2">
                      <span>{entry.playerName}</span>
                      {isUser && (
                        <span className="text-[10px] font-mono text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full font-extrabold">
                          TÚ
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {entry.country} · {entry.timestamp}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-black font-mono tabular-nums text-slate-900">
                    {entry.score}
                  </div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 font-bold">
                    {entry.mode}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
