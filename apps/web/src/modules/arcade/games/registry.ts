import { type GameDefinition, type GameCategory, type GameResourcesDeclaration } from '../types/game';

type GameModule = Record<string, unknown>;

function isGameDefinition(value: unknown): value is GameDefinition {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<GameDefinition>;
  return typeof candidate.id === 'string'
    && typeof candidate.title === 'string'
    && typeof candidate.Component === 'function';
}

const gameModules = import.meta.glob<GameModule>('./*/index.{ts,tsx}', { eager: true });
const resourceLoaders = import.meta.glob<GameModule>('./*/resources.ts');

export const ALL_GAMES: GameDefinition[] = Object.values(gameModules)
  .flatMap((module) => Object.values(module).filter(isGameDefinition))
  .sort((left, right) => left.title.localeCompare(right.title));

export async function loadGameResources(gameId: string): Promise<GameResourcesDeclaration | undefined> {
  const loader = resourceLoaders[`./${gameId}/resources.ts`];
  if (!loader) return undefined;
  const module = await loader();
  const resources = module.resources;
  return resources && typeof resources === 'object' ? resources as GameResourcesDeclaration : undefined;
}

export function getAllGames(): GameDefinition[] {
  return ALL_GAMES;
}

export function getGameById(id: string): GameDefinition | undefined {
  return ALL_GAMES.find((g) => g.id === id);
}

export function getGamesByCategory(category: GameCategory): GameDefinition[] {
  if (category === 'all') return ALL_GAMES;
  return ALL_GAMES.filter((g) => g.category === category);
}

export function getRandomGameForFrenzy(excludeId?: string): GameDefinition {
  const eligible = ALL_GAMES.filter((g) => g.dimension === '2d' && g.id !== excludeId && g.id !== 'pachinko-drop');
  if (eligible.length === 0) return ALL_GAMES[0];
  const idx = Math.floor(Math.random() * eligible.length);
  return eligible[idx];
}
