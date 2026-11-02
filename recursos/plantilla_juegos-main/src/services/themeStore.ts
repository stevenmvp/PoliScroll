import {
  type BiomeType,
  type BiomeConfig,
  type MarbleStyleId,
  type MarbleStyle,
  type UIButtonStyle,
  type ThemeSettings,
} from '../types/theme';

export const BIOMES: Record<BiomeType, BiomeConfig> = {
  cyber: {
    id: 'cyber',
    name: 'Cyber Fluorescente',
    tagline: 'Laboratorio de alto contraste, acentos fluorescentes y horizonte cristalino',
    skyGradient: ['#f8fafc', '#e2e8f0'],
    fogColor: '#f1f5f9',
    groundColor: '#0f172a',
    accentColor: '#4f46e5',
    secondaryColor: '#06b6d4',
    hudBg: 'rgba(255, 255, 255, 0.95)',
    ambientLightColor: '#ffffff',
    sunColor: '#6366f1',
    particleColor: '#06b6d4',
  },
  snow: {
    id: 'snow',
    name: 'Nevado Glaciar',
    tagline: 'Picos alpinos cubiertos de nieve pura, cielo turquesa y niebla fresca',
    skyGradient: ['#e0f2fe', '#bae6fd'],
    fogColor: '#e0f2fe',
    groundColor: '#f8fafc',
    accentColor: '#0284c7',
    secondaryColor: '#38bdf8',
    hudBg: 'rgba(240, 249, 255, 0.95)',
    ambientLightColor: '#f0f9ff',
    sunColor: '#38bdf8',
    particleColor: '#e0f2fe',
  },
  desert: {
    id: 'desert',
    name: 'Dunas del Desierto',
    tagline: 'Arenas doradas esculpidas por el viento, sol ámbar radiante y cielos cálidos',
    skyGradient: ['#fef3c7', '#fde68a'],
    fogColor: '#fef3c7',
    groundColor: '#d97706',
    accentColor: '#d97706',
    secondaryColor: '#f59e0b',
    hudBg: 'rgba(254, 252, 232, 0.95)',
    ambientLightColor: '#fef3c7',
    sunColor: '#fbbf24',
    particleColor: '#f59e0b',
  },
  jungle: {
    id: 'jungle',
    name: 'Jungla Esmeralda',
    tagline: 'Follaje verde vivo, canopia botánica exuberante y bruma tropical fresca',
    skyGradient: ['#dcfce7', '#bbf7d0'],
    fogColor: '#dcfce7',
    groundColor: '#15803d',
    accentColor: '#059669',
    secondaryColor: '#10b981',
    hudBg: 'rgba(240, 253, 244, 0.95)',
    ambientLightColor: '#ecfdf5',
    sunColor: '#34d399',
    particleColor: '#10b981',
  },
};

export const MARBLE_STYLES: MarbleStyle[] = [
  {
    id: 'amber',
    name: 'Ámbar Solar',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.65)',
    highlight: '#fef3c7',
    rarity: 'Común',
    description: 'Canica clásica de resina solar pulida con núcleo de fuego dorado.',
  },
  {
    id: 'pearl',
    name: 'Perla Lunar Iridiscente',
    color: '#f8fafc',
    glow: 'rgba(226, 232, 240, 0.85)',
    highlight: '#ffffff',
    rarity: 'Rara',
    description: 'Nácar puro recogido bajo la luz cenital con reflejos prismáticos.',
  },
  {
    id: 'emerald',
    name: 'Esmeralda Vital',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.7)',
    highlight: '#a7f3d0',
    rarity: 'Rara',
    description: 'Gema pulida de cristal esmeralda extraída de antiguas ruinas botánicas.',
  },
  {
    id: 'ruby',
    name: 'Rubí Carmesí',
    color: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.7)',
    highlight: '#fecaca',
    rarity: 'Épica',
    description: 'Fuego volcánico concentrado en un orbe esférico de alta refracción.',
  },
  {
    id: 'sapphire',
    name: 'Zafiro Estelar',
    color: '#0ea5e9',
    glow: 'rgba(14, 165, 233, 0.7)',
    highlight: '#bae6fd',
    rarity: 'Épica',
    description: 'Cristal celeste con resonancia acústica pura y estela de luz.',
  },
  {
    id: 'gold',
    name: 'Oro Imperial 24K',
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.85)',
    highlight: '#fffbeb',
    rarity: 'Legendaria',
    description: 'Aleación legendaria que resuena con los premios mayores del Jackpot.',
  },
  {
    id: 'amethyst',
    name: 'Amatista Mística',
    color: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.75)',
    highlight: '#ede9fe',
    rarity: 'Legendaria',
    description: 'Cuarzo violeta imbuido con propiedades socráticas de razonamiento.',
  },
];

const STORAGE_KEY = 'vortex_arcade_theme_v2';

class ThemeStore {
  private settings: ThemeSettings;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.settings = this.loadSettings();
    if (typeof window !== 'undefined') {
      document.addEventListener('fullscreenchange', () => {
        const isFull = !!document.fullscreenElement;
        if (this.settings.isFullscreen !== isFull) {
          this.settings.isFullscreen = isFull;
          this.notify();
        }
      });
    }
  }

  private loadSettings(): ThemeSettings {
    const defaults: ThemeSettings = {
      activeBiome: 'cyber',
      activeMarbleStyle: 'amber',
      activeUIStyle: 'modern',
      isFullscreen: false,
    };
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaults, ...JSON.parse(saved), isFullscreen: false };
      }
    } catch {}
    return defaults;
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
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

  public getSettings(): ThemeSettings {
    return { ...this.settings };
  }

  public getBiome(): BiomeConfig {
    return BIOMES[this.settings.activeBiome] || BIOMES.cyber;
  }

  public getMarbleStyle(): MarbleStyle {
    return (
      MARBLE_STYLES.find((m) => m.id === this.settings.activeMarbleStyle) ||
      MARBLE_STYLES[0]
    );
  }

  public setBiome(biome: BiomeType): void {
    this.settings.activeBiome = biome;
    this.save();
  }

  public setMarbleStyle(styleId: MarbleStyleId): void {
    this.settings.activeMarbleStyle = styleId;
    this.save();
  }

  public setUIStyle(style: UIButtonStyle): void {
    this.settings.activeUIStyle = style;
    this.save();
  }

  public async toggleFullscreen(element?: HTMLElement): Promise<boolean> {
    if (typeof document === 'undefined') return false;

    try {
      if (!document.fullscreenElement) {
        const target = element || document.documentElement;
        if (target.requestFullscreen) {
          await target.requestFullscreen();
          this.settings.isFullscreen = true;
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          this.settings.isFullscreen = false;
        }
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
    this.notify();
    return this.settings.isFullscreen;
  }
}

export const themeStore = new ThemeStore();
