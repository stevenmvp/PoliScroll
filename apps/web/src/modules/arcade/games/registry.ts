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
const resourceModules = import.meta.glob<GameModule>('./*/resources.ts', { eager: true });

const resourcesByGameId = new Map<string, GameResourcesDeclaration>();
Object.entries(resourceModules).forEach(([path, module]) => {
  const gameId = path.match(/^\.\/([^/]+)\/resources\.ts$/)?.[1];
  const resources = module.resources;
  if (gameId && resources && typeof resources === 'object') {
    resourcesByGameId.set(gameId, resources as GameResourcesDeclaration);
  }
});

export const ALL_GAMES: GameDefinition[] = Object.values(gameModules)
  .flatMap((module) => Object.values(module).filter(isGameDefinition))
  .map((game) => ({ ...game, resources: game.resources ?? resourcesByGameId.get(game.id) }))
  .sort((left, right) => left.title.localeCompare(right.title));

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
