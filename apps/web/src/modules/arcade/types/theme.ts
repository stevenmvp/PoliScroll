export type BiomeType = 'snow' | 'desert' | 'jungle' | 'cyber';

export interface BiomeConfig {
  id: BiomeType;
  name: string;
  tagline: string;
  skyGradient: [string, string];
  fogColor: string;
  groundColor: string;
  accentColor: string;
  secondaryColor: string;
  hudBg: string;
  ambientLightColor: string;
  sunColor: string;
  particleColor: string;
}

export type MarbleStyleId = 'amber' | 'pearl' | 'emerald' | 'ruby' | 'sapphire' | 'gold' | 'amethyst';

export interface MarbleStyle {
  id: MarbleStyleId;
  name: string;
  color: string;
  glow: string;
  highlight: string;
  rarity: 'Común' | 'Rara' | 'Épica' | 'Legendaria';
  description: string;
}

export type UIButtonStyle = 'modern' | 'fluorescent' | 'retro';

export interface ThemeSettings {
  activeBiome: BiomeType;
  activeMarbleStyle: MarbleStyleId;
  activeUIStyle: UIButtonStyle;
  isFullscreen: boolean;
}
