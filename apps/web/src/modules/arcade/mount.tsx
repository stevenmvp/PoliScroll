import { createRoot, type Root } from "react-dom/client";
import ArcadeModule from "./ArcadeModule";
import type { GameDefinition, GameResult } from "./types/game";
import { createActivitySession, finishActivitySession, recordActivityEvent } from "../../services/data";

let arcadeRoot: Root | null = null;

export function mountArcade(host: HTMLElement): void {
  arcadeRoot?.unmount();
  arcadeRoot = createRoot(host);
  arcadeRoot.render(<ArcadeModule onGameResult={persistGameResult} />);
}

export function unmountArcade(): void {
  arcadeRoot?.unmount();
  arcadeRoot = null;
}

function persistGameResult(game: GameDefinition, result: GameResult): void {
  const durationMs = Math.max(0, Math.round((result.timeSurvived ?? 0) * 1000));
  const startedAt = new Date(Date.now() - durationMs).toISOString();
  void createActivitySession({
    activityId: game.id,
    activityTitle: game.title,
    startedAt,
    topic: "Arcade educativo",
  }).then(async (sessionId) => {
    await recordActivityEvent({
      sessionId,
      activityId: game.id,
      gameId: game.id,
      eventType: result.won ? "completed" : "game_over",
      scoreAfter: result.score,
      timeRemainingMs: result.timeSurvived ? 0 : undefined,
      payload: {
        accuracy: result.accuracy,
        marblesEarned: result.marblesEarned,
        stats: result.stats,
      },
    });
    await finishActivitySession({
      sessionId,
      score: result.score,
      durationMs,
      completed: result.won,
      abandoned: false,
    });
  }).catch((error: unknown) => {
    console.error("No se pudo sincronizar el resultado del arcade.", error);
  });
}
