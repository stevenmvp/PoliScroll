export type GameplayMode = 'academia' | 'arcade';
export type TrainingPreset = 'free' | 'quick3' | 'classic5' | 'custom';
export type MetronomeSpeedTier = 'lento' | 'medio' | 'rapido';

export interface GameOverrideConfig {
  enabled: boolean;
  difficulty: 'facil' | 'medio' | 'experto';
  speedMultiplier: number;
  customTitle?: string;
  customInstruction?: string;
}

export interface ArcadeConfig {
  gameplayMode: GameplayMode;
  trainingPreset: TrainingPreset;
  customTrainingCount: number;
  frenzyDuration: number; // 10, 15, or custom 5-30
  metronomeTier: MetronomeSpeedTier;
  metronomeAudioEnabled: boolean;
  autoAccelerateMetronome: boolean;
  gameOverrides: Record<string, GameOverrideConfig>;
}

const STORAGE_KEY = 'vortex_arcade_master_config_v1';

const DEFAULT_CONFIG: ArcadeConfig = {
  gameplayMode: 'academia',
  trainingPreset: 'free',
  customTrainingCount: 4,
  frenzyDuration: 10,
  metronomeTier: 'lento',
  metronomeAudioEnabled: true,
  autoAccelerateMetronome: true,
  gameOverrides: {},
};

export const METRONOME_TIERS: Record<MetronomeSpeedTier, { label: string; bpm: number; multiplier: number; color: string }> = {
  lento: { label: 'Lento (1.0x)', bpm: 105, multiplier: 1.0, color: '#38bdf8' },
  medio: { label: 'Medio (1.35x)', bpm: 135, multiplier: 1.35, color: '#f59e0b' },
  rapido: { label: 'Rápido (1.75x)', bpm: 170, multiplier: 1.75, color: '#ef4444' },
};

export class ArcadeConfigStore {
  private config: ArcadeConfig;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.config = this.load();
  }

  private load(): ArcadeConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_CONFIG, ...parsed };
      }
    } catch {}
    return { ...DEFAULT_CONFIG };
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
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

  public getConfig(): ArcadeConfig {
    return { ...this.config };
  }

  public getGameplayMode(): GameplayMode {
    return this.config.gameplayMode;
  }

  public setGameplayMode(mode: GameplayMode): void {
    this.config.gameplayMode = mode;
    this.save();
  }

  public toggleGameplayMode(): GameplayMode {
    const next = this.config.gameplayMode === 'academia' ? 'arcade' : 'academia';
    this.setGameplayMode(next);
    return next;
  }

  public getTrainingPreset(): TrainingPreset {
    return this.config.trainingPreset;
  }

  public setTrainingPreset(preset: TrainingPreset, customCount?: number): void {
    this.config.trainingPreset = preset;
    if (customCount !== undefined) {
      this.config.customTrainingCount = Math.max(2, Math.min(16, customCount));
    }
    this.save();
  }

  public getEffectiveTrainingCount(): number {
    if (this.config.trainingPreset === 'quick3') return 3;
    if (this.config.trainingPreset === 'classic5') return 5;
    if (this.config.trainingPreset === 'custom') return this.config.customTrainingCount;
    return 3;
  }

  public getFrenzyDuration(): number {
    return this.config.frenzyDuration;
  }

  public setFrenzyDuration(seconds: number): void {
    this.config.frenzyDuration = Math.max(5, Math.min(30, seconds));
    this.save();
  }

  public getMetronomeTier(): MetronomeSpeedTier {
    return this.config.metronomeTier;
  }

  public setMetronomeTier(tier: MetronomeSpeedTier): void {
    this.config.metronomeTier = tier;
    this.save();
  }

  public advanceMetronomeTier(): MetronomeSpeedTier {
    const tiers: MetronomeSpeedTier[] = ['lento', 'medio', 'rapido'];
    const idx = tiers.indexOf(this.config.metronomeTier);
    const next = tiers[(idx + 1) % tiers.length];
    this.setMetronomeTier(next);
    return next;
  }

  public getEffectiveSpeedMultiplier(): number {
    return METRONOME_TIERS[this.config.metronomeTier].multiplier;
  }

  public isMetronomeAudioEnabled(): boolean {
    return this.config.metronomeAudioEnabled;
  }

  public setMetronomeAudioEnabled(enabled: boolean): void {
    this.config.metronomeAudioEnabled = enabled;
    this.save();
  }

  public isAutoAccelerateEnabled(): boolean {
    return this.config.autoAccelerateMetronome;
  }

  public setAutoAccelerateEnabled(enabled: boolean): void {
    this.config.autoAccelerateMetronome = enabled;
    this.save();
  }

  public getGameOverride(gameId: string): GameOverrideConfig {
    return (
      this.config.gameOverrides[gameId] || {
        enabled: true,
        difficulty: 'medio',
        speedMultiplier: 1.0,
      }
    );
  }

  public updateGameOverride(gameId: string, updates: Partial<GameOverrideConfig>): void {
    const curr = this.getGameOverride(gameId);
    this.config.gameOverrides[gameId] = { ...curr, ...updates };
    this.save();
  }

  public isGameEnabled(gameId: string): boolean {
    return this.getGameOverride(gameId).enabled !== false;
  }

  public resetAllOverrides(): void {
    this.config.gameOverrides = {};
    this.config.metronomeTier = 'lento';
    this.config.frenzyDuration = 10;
    this.config.trainingPreset = 'free';
    this.save();
  }
}

export const arcadeConfigStore = new ArcadeConfigStore();
