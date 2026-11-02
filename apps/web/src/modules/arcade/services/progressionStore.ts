import { type LeaderboardEntry, type MarbleSkin } from '../types/game';

const MARBLE_SKINS: MarbleSkin[] = [
  {
    id: 'neon-amber',
    name: 'Ámbar Neón',
    color: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.6)',
    price: 0,
    unlocked: true,
    description: 'La canica clásica forjada con cuarzo incandescente.',
  },
  {
    id: 'cyber-cyan',
    name: 'Cian Cuántico',
    color: '#06B6D4',
    glow: 'rgba(6, 182, 212, 0.6)',
    price: 30,
    unlocked: true,
    description: 'Genera un rastro de iones fríos al rebotar.',
  },
  {
    id: 'plasma-pink',
    name: 'Plasma Violeta',
    color: '#EC4899',
    glow: 'rgba(236, 72, 153, 0.6)',
    price: 60,
    unlocked: false,
    description: 'Cargada con partículas estroboscópicas de alta frecuencia.',
  },
  {
    id: 'solar-gold',
    name: 'Oro Solar',
    color: '#FBBF24',
    glow: 'rgba(251, 191, 36, 0.8)',
    price: 120,
    unlocked: false,
    description: 'Aleación estelar legendaria que resuena con tonos armónicos.',
  },
  {
    id: 'matrix-green',
    name: 'Matriz Esmeralda',
    color: '#10B981',
    glow: 'rgba(16, 185, 129, 0.6)',
    price: 80,
    unlocked: false,
    description: 'Flujo de código hiper-comprimido en esfera cristalina.',
  },
];

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'lb-1', playerName: 'Kael_99', country: 'ES', score: 2840, mode: 'frenzy', avatarSeed: 'kael', timestamp: 'Hace 2 min' },
  { id: 'lb-2', playerName: 'NovaValkyrie', country: 'MX', score: 2610, mode: 'frenzy', avatarSeed: 'nova', timestamp: 'Hace 5 min' },
  { id: 'lb-3', playerName: 'PixelRonin', country: 'JP', score: 2450, mode: 'frenzy', avatarSeed: 'ronin', timestamp: 'Hace 11 min' },
  { id: 'lb-4', playerName: 'AuraBeat', country: 'CO', score: 2190, mode: 'frenzy', avatarSeed: 'aura', timestamp: 'Hace 18 min' },
  { id: 'lb-5', playerName: 'VortexPilot', country: 'AR', score: 1980, mode: 'frenzy', avatarSeed: 'vortex', timestamp: 'Hace 24 min' },
  { id: 'lb-6', playerName: 'ZeroLag', country: 'US', score: 1820, mode: 'frenzy', avatarSeed: 'zero', timestamp: 'Hace 35 min' },
  { id: 'lb-7', playerName: 'SynthWave90', country: 'CL', score: 1650, mode: 'frenzy', avatarSeed: 'synth', timestamp: 'Hace 42 min' },
];

export interface PlayerProgression {
  marbles: number;
  totalMarblesEarned: number;
  unlockedGames: string[];
  unlockedSkins: string[];
  activeSkin: string;
  gameHighScores: Record<string, number>;
  frenzyBestStreak: number;
  frenzyBestScore: number;
  playerName: string;
}

const STORAGE_KEY = 'vortex_arcade_progression_v1';

export class ProgressionStore {
  private data: PlayerProgression;
  private listeners: Set<() => void> = new Set();
  private leaderboard: LeaderboardEntry[] = [...INITIAL_LEADERBOARD];

  constructor() {
    this.data = this.load();
    this.startLeaderboardSimulation();
  }

  private load(): PlayerProgression {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}

    return {
      marbles: 40, // bonus inicial para probar el Pachinko/Gachapón inmediatamente
      totalMarblesEarned: 40,
      unlockedGames: ['cyber-runner-3d', 'neon-orbit-beat', 'pixel-slash-reflex', 'pachinko-drop'],
      unlockedSkins: ['neon-amber', 'cyber-cyan'],
      activeSkin: 'neon-amber',
      gameHighScores: {},
      frenzyBestStreak: 0,
      frenzyBestScore: 0,
      playerName: 'Player_' + Math.floor(1000 + Math.random() * 9000),
    };
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {}
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public getData(): PlayerProgression {
    return { ...this.data };
  }

  public getMarbles(): number {
    return this.data.marbles;
  }

  public addMarbles(amount: number): void {
    if (amount <= 0) return;
    this.data.marbles += amount;
    this.data.totalMarblesEarned += amount;
    this.save();
  }

  public spendMarbles(amount: number): boolean {
    if (this.data.marbles < amount) return false;
    this.data.marbles -= amount;
    this.save();
    return true;
  }

  public isGameUnlocked(gameId: string): boolean {
    return this.data.unlockedGames.includes(gameId);
  }

  public unlockGame(gameId: string): void {
    if (!this.data.unlockedGames.includes(gameId)) {
      this.data.unlockedGames.push(gameId);
      this.save();
    }
  }

  public getAvailableSkins(): MarbleSkin[] {
    return MARBLE_SKINS.map((s) => ({
      ...s,
      unlocked: this.data.unlockedSkins.includes(s.id),
    }));
  }

  public unlockSkin(skinId: string): void {
    if (!this.data.unlockedSkins.includes(skinId)) {
      this.data.unlockedSkins.push(skinId);
      this.save();
    }
  }

  public setActiveSkin(skinId: string): void {
    if (this.data.unlockedSkins.includes(skinId)) {
      this.data.activeSkin = skinId;
      this.save();
    }
  }

  public getActiveSkin(): MarbleSkin {
    return MARBLE_SKINS.find((s) => s.id === this.data.activeSkin) || MARBLE_SKINS[0];
  }

  public recordGameScore(gameId: string, score: number): void {
    const currentHigh = this.data.gameHighScores[gameId] || 0;
    if (score > currentHigh) {
      this.data.gameHighScores[gameId] = score;
      this.save();
    }
  }

  public recordFrenzyRun(score: number, streak: number): void {
    let updated = false;
    if (score > this.data.frenzyBestScore) {
      this.data.frenzyBestScore = score;
      updated = true;
      // Post to leaderboard
      this.leaderboard.unshift({
        id: 'player-' + Date.now(),
        playerName: this.data.playerName,
        country: 'ES',
        score,
        mode: 'frenzy',
        avatarSeed: 'player',
        timestamp: 'Ahora mismo',
      });
      this.leaderboard.sort((a, b) => b.score - a.score);
      this.leaderboard = this.leaderboard.slice(0, 15);
    }
    if (streak > this.data.frenzyBestStreak) {
      this.data.frenzyBestStreak = streak;
      updated = true;
    }
    if (updated) this.save();
  }

  public getLeaderboard(): LeaderboardEntry[] {
    return [...this.leaderboard];
  }

  private startLeaderboardSimulation(): void {
    // Periodically update or simulate other players scoring
    setInterval(() => {
      const names = ['Hyperion', 'Zephyr', 'Solaris', 'GlitchArt', 'VoxelQueen', 'EchoStrike'];
      const countries = ['FR', 'BR', 'DE', 'KR', 'GB', 'CA'];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      const randomScore = Math.floor(1500 + Math.random() * 1400);

      const newEntry: LeaderboardEntry = {
        id: 'sim-' + Date.now(),
        playerName: randomName + '_' + Math.floor(Math.random() * 99),
        country: randomCountry,
        score: randomScore,
        mode: 'frenzy',
        avatarSeed: randomName.toLowerCase(),
        timestamp: 'Ahora mismo',
      };

      this.leaderboard.push(newEntry);
      this.leaderboard.sort((a, b) => b.score - a.score);
      this.leaderboard = this.leaderboard.slice(0, 15);
      this.notify();
    }, 28000);
  }
}

export const progressionStore = new ProgressionStore();
