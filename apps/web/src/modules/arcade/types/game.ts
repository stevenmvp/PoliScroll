import type React from 'react';

export type GameCategory = 'all' | '3d' | 'rhythm' | 'reflex' | 'logic';
export type GameDimension = '2d' | '3d';
export type GameDifficulty = 'facil' | 'medio' | 'experto';

export interface GameResult {
  score: number;
  marblesEarned: number;
  accuracy?: number;
  timeSurvived?: number;
  won: boolean;
  stats?: Record<string, number | string>;
}

export interface GameInstanceProps {
  onGameOver: (result: GameResult) => void;
  isFrenzyMode?: boolean;
  frenzyTimeLeft?: number;
  soundEnabled?: boolean;
  marbleSkin?: string;
  onScoreUpdate?: (currentScore: number) => void;
}

export interface GameArticle {
  lore: string;
  mechanics: string;
  tips: string[];
}

export interface GameResourcesDeclaration {
  fonts?: string[];
  images?: string[];
  animations?: string[];
  sounds?: string[];
}

export interface GameDefinition {
  id: string;
  title: string;
  dimension: GameDimension;
  category: GameCategory;
  difficulty: GameDifficulty;
  tagline: string;
  instruction: string;
  article: GameArticle;
  controlsDescription: {
    desktop: string;
    mobile: string;
  };
  icon: string;
  color: string;
  accentColor: string;
  unlockedByDefault: boolean;
  unlockCost: number;
  resources?: GameResourcesDeclaration;
  Component: React.ComponentType<GameInstanceProps>;
}

export interface MarbleSkin {
  id: string;
  name: string;
  color: string;
  glow: string;
  price: number;
  unlocked: boolean;
  description: string;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  country: string;
  score: number;
  mode: 'frenzy' | 'catalog';
  gameId?: string;
  avatarSeed: string;
  timestamp: string;
}
