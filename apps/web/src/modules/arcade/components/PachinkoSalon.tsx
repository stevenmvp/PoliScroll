import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { progressionStore } from '../services/progressionStore';
import { soundManager } from '../services/soundManager';
import { getAllGames } from '../games/registry';
import { PachinkoDropView } from '../games/pachinko-drop/view';
import { Sparkles, CircleDot, Gift, Check } from 'lucide-react';

export const PachinkoSalon: React.FC = () => {
  const [marbles, setMarbles] = useState(progressionStore.getMarbles());
  const [skins, setSkins] = useState(progressionStore.getAvailableSkins());
  const [activeSkinId, setActiveSkinId] = useState(progressionStore.getActiveSkin().id);
  const [isOpeningGacha, setIsOpeningGacha] = useState(false);
  const [unboxedReward, setUnboxedReward] = useState<{
    title: string;
    description: string;
    type: 'game' | 'skin' | 'marbles';
    color: string;
    rarity: 'Común' | 'Rara' | 'Épica' | 'Legendaria';
  } | null>(null);

  const [unboxingStep, setUnboxingStep] = useState<'idle' | 'crank' | 'drop' | 'cracking' | 'burst' | 'revealed'>('idle');

  useEffect(() => {
    return progressionStore.subscribe(() => {
      setMarbles(progressionStore.getMarbles());
      setSkins(progressionStore.getAvailableSkins());
      setActiveSkinId(progressionStore.getActiveSkin().id);
    });
  }, []);

  const handlePullGachapon = async () => {
    const cost = 20;
    if (marbles < cost || isOpeningGacha) {
      soundManager.playHit();
      return;
    }

    await soundManager.initAudio();
    progressionStore.spendMarbles(cost);
    setIsOpeningGacha(true);
    setUnboxingStep('crank');
    soundManager.playClick('A3');

    // Sequence of animations: Crank -> Drop -> Crack -> Burst -> Reveal
    setTimeout(() => {
      setUnboxingStep('drop');
      soundManager.playClick('E4');
    }, 450);

    setTimeout(() => {
      setUnboxingStep('cracking');
      soundManager.playClick('C5');
    }, 900);

    setTimeout(() => {
      setUnboxingStep('burst');
      soundManager.playGachaponOpen();
      confetti({ particleCount: 110, spread: 100, origin: { y: 0.55 } });

      // Determine prize
      const allGames = getAllGames();
      const lockedGames = allGames.filter((g) => !progressionStore.isGameUnlocked(g.id));
      const lockedSkins = skins.filter((s) => !s.unlocked);

      if (lockedGames.length > 0 && Math.random() < 0.45) {
        const wonGame = lockedGames[0];
        progressionStore.unlockGame(wonGame.id);
        setUnboxedReward({
          title: wonGame.title,
          description: wonGame.tagline,
          type: 'game',
          color: wonGame.color,
          rarity: 'Épica',
        });
      } else if (lockedSkins.length > 0 && Math.random() < 0.65) {
        const wonSkin = lockedSkins[0];
        progressionStore.unlockSkin(wonSkin.id);
        progressionStore.setActiveSkin(wonSkin.id);
        setUnboxedReward({
          title: wonSkin.name,
          description: wonSkin.description,
          type: 'skin',
          color: wonSkin.color,
          rarity: 'Rara',
        });
      } else {
        const bonus = 40 + Math.floor(Math.random() * 35);
        progressionStore.addMarbles(bonus);
        setUnboxedReward({
          title: `¡Jackpot de +${bonus} Canicas!`,
          description: `Has obtenido una bolsa condensada de canicas solares listas para Pachinko.`,
          type: 'marbles',
          color: '#F59E0B',
          rarity: 'Legendaria',
        });
      }

      setUnboxingStep('revealed');
      setIsOpeningGacha(false);
    }, 1500);
  };

  const handleSelectSkin = (skinId: string) => {
    progressionStore.setActiveSkin(skinId);
    soundManager.playClick('E4');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-10 select-none">
      {/* Hero Welcome Banner in Clean Light Modern Aesthetic */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 mb-2">
            <span>SALÓN DE RECOMPENSAS &amp; COLECCIÓN</span>
            <span aria-hidden="true">·</span>
            <span>GACHAPÓN VORTEX</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Máquina de Gachapón &amp; Mesa Pachinko
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-xl leading-relaxed">
            Utiliza tus canicas ganadas en los minijuegos para abrir cápsulas doradas. Desbloquea skins de canica, pistas sintetizadas y nuevos juegos para tu catálogo.
          </p>
        </div>

        {/* Current Balance Display */}
        <div className="bg-amber-50 border border-amber-200/90 p-5 rounded-2xl flex items-center gap-4 shadow-xs shrink-0">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <CircleDot className="w-6 h-6 text-amber-600 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-amber-800 font-bold">Billetera de Canicas</div>
            <div className="text-3xl font-black font-mono text-amber-950 tabular-nums">{marbles}</div>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid: Gachapon on Left, Pachinko on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Gachapon Machine (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
          <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100 font-bold">
            <span className="text-slate-900">Dispensador de Cápsulas</span>
            <span className="font-mono text-amber-700">20 Canicas / Giro</span>
          </div>

          {/* Gachapon Dome Visual Graphic */}
          <div className="relative w-56 h-56 rounded-full bg-slate-50 border-4 border-slate-200 flex items-center justify-center shadow-inner overflow-hidden mb-6">
            <div className="absolute inset-0 bg-radial from-violet-500/10 via-transparent to-transparent pointer-events-none" />

            {/* Floating colorful capsules inside dome */}
            <div className="grid grid-cols-3 gap-3 p-4">
              {['#F59E0B', '#06B6D4', '#EC4899', '#8B5CF6', '#10B981', '#38BDF8'].map((col, i) => (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center border border-white/40 transition-transform ${
                    isOpeningGacha ? 'animate-bounce' : ''
                  }`}
                  style={{
                    backgroundColor: col,
                    transform: `rotate(${i * 45}deg)`,
                  }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white/70" />
                </div>
              ))}
            </div>

            {/* Crank handle label */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-xs">
              DISPENSADOR
            </div>
          </div>

          {/* Crank Pull Button */}
          <button
            onClick={handlePullGachapon}
            disabled={marbles < 20 || isOpeningGacha}
            className={`w-full py-4 rounded-2xl font-black text-sm md:text-base flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 ${
              marbles >= 20 && !isOpeningGacha
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-200'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <Gift className="w-5 h-5" />
            <span>{isOpeningGacha ? 'Dispensando Cápsula...' : 'Girar Gachapón (20 Canicas)'}</span>
          </button>

          <p className="mt-3 text-xs text-slate-500 font-medium">
            Contiene nuevos minijuegos, skins de canicas luminosas y jackpots de bonus.
          </p>
        </div>

        {/* High-Fidelity Gachapon Capsule Cracking & Unboxing Modal */}
        {unboxingStep !== 'idle' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in-0 duration-300">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden">
              {/* Capsule Hatching Stage Visuals */}
              {unboxingStep !== 'revealed' ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-6">
                  {/* Glowing Energy Aura */}
                  <div className="relative">
                    <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-amber-400 via-rose-400 to-cyan-400 flex items-center justify-center shadow-2xl relative animate-pulse">
                      {/* Cracking Light Fissures */}
                      {unboxingStep === 'cracking' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-1.5 bg-white shadow-[0_0_15px_#ffffff] rotate-45 transform scale-x-125 animate-ping" />
                          <div className="w-full h-1 bg-amber-200 shadow-[0_0_12px_#fde68a] -rotate-30 transform scale-x-110" />
                        </div>
                      )}
                      {/* Top Hemisphere */}
                      <div className="w-32 h-16 rounded-t-full bg-white/90 border-b border-amber-300 flex items-center justify-center shadow-inner">
                        <Sparkles className="w-6 h-6 text-amber-500 animate-spin" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      {unboxingStep === 'crank' && '¡Mecanismo activado!'}
                      {unboxingStep === 'drop' && '¡Cápsula dorada en posición!'}
                      {unboxingStep === 'cracking' && '¡Abriendo esfera prismática...!'}
                      {unboxingStep === 'burst' && '¡Eclosión de recompensa!'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      Energía de canica en resonancia socrática...
                    </p>
                  </div>
                </div>
              ) : (
                /* Revealed Collectible Card */
                unboxedReward && (
                  <div className="py-2 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                    {/* Rarity Ribbon */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-[11px] font-black uppercase tracking-wider mb-4">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{unboxedReward.rarity}</span>
                    </div>

                    {/* Card Trophy Visual */}
                    <div
                      className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center shadow-xl border-4 border-white mb-4 relative"
                      style={{
                        backgroundColor: unboxedReward.color,
                        boxShadow: `0 10px 25px ${unboxedReward.color}55`,
                      }}
                    >
                      <div className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center shadow-inner">
                        <Gift className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900">
                      {unboxedReward.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 max-w-xs leading-relaxed">
                      {unboxedReward.description}
                    </p>

                    <button
                      onClick={() => {
                        soundManager.playClick('A4');
                        setUnboxingStep('idle');
                        setUnboxedReward(null);
                      }}
                      className="mt-6 w-full py-3.5 rounded-2xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md active:scale-95 transition-all"
                    >
                      Reclamar Recompensa &amp; Continuar
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Right Column: Pachinko Physical Board (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100 font-bold">
            <span className="text-slate-900">Mesa de Pachinko Parabólica</span>
            <span>Doble rampa de lanzamiento &amp; aro Jackpot</span>
          </div>

          <div className="flex items-center justify-center">
            <PachinkoDropView
              onGameOver={() => {}}
              isFrenzyMode={false}
            />
          </div>
        </div>
      </div>

      {/* Marble Skins Wardrobe */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100 font-bold">
          <span className="text-slate-900">Armario de Skins de Canica</span>
          <span>Equipa tu estilo para todos los juegos 2D y 3D</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {skins.map((skin) => {
            const isEquipped = activeSkinId === skin.id;

            return (
              <div
                key={skin.id}
                onClick={() => {
                  if (skin.unlocked) handleSelectSkin(skin.id);
                }}
                className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                  !skin.unlocked
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : isEquipped
                    ? 'bg-violet-50 border-violet-400 shadow-xs ring-2 ring-violet-300 cursor-pointer'
                    : 'bg-white border-slate-200 hover:border-slate-300 cursor-pointer'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    {/* Marble Preview Dot with glow */}
                    <div
                      className="w-8 h-8 rounded-full shadow-sm flex items-center justify-center border border-white"
                      style={{
                        backgroundColor: skin.color,
                        boxShadow: `0 0 10px ${skin.glow}`,
                      }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-white/70" />
                    </div>

                    {isEquipped && (
                      <span className="text-[11px] font-mono font-bold text-violet-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Equipada
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-black text-slate-900">{skin.name}</div>
                  <div className="text-xs text-slate-500 mt-1 line-clamp-2">{skin.description}</div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100">
                  {skin.unlocked ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSkin(skin.id);
                      }}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        isEquipped
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isEquipped ? 'Activa' : 'Equipar'}
                    </button>
                  ) : (
                    <div className="text-[11px] font-mono text-amber-700 font-bold">
                      Desbloqueable en Gachapón
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
