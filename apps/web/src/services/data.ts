import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../amplify/data/resource";
import type { AuthSession } from "../domain/identity";

const client = generateClient<Schema>();

export async function ensureUserProfile(session: AuthSession): Promise<void> {
  const profiles = await client.models.UserProfile.list({
    filter: { owner: { eq: session.user.id } },
    limit: 1,
  });

  if (profiles.errors?.length) {
    throw new Error("No se pudo consultar el perfil del usuario.");
  }
  if (profiles.data[0]) return;

  const result = await client.models.UserProfile.create({
    displayName: session.user.displayName,
    email: session.user.email,
    role: session.user.role === "super_admin" ? "super_admin" : session.user.role,
    status: "active",
    interests: [],
  });

  if (result.errors?.length) {
    throw new Error("No se pudo crear el perfil del usuario.");
  }
}

export async function createActivitySession(input: {
  activityId: string;
  activityTitle: string;
  topic?: string;
  startedAt: string;
}): Promise<string> {
  const result = await client.models.ActivitySession.create({
    activityId: input.activityId,
    activityTitle: input.activityTitle,
    topic: input.topic,
    startedAt: input.startedAt,
    score: 0,
    completed: false,
    abandoned: false,
  });
  if (result.errors?.length || !result.data) {
    throw new Error("No se pudo iniciar la trazabilidad de la actividad.");
  }
  return result.data.id;
}

export async function recordActivityEvent(input: {
  sessionId: string;
  activityId: string;
  gameId?: string;
  eventType: string;
  stage?: number;
  scoreBefore?: number;
  scoreAfter?: number;
  timeRemainingMs?: number;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const result = await client.models.ActivityEvent.create({
    sessionId: input.sessionId,
    activityId: input.activityId,
    gameId: input.gameId,
    eventType: input.eventType,
    stage: input.stage,
    timestamp: new Date().toISOString(),
    scoreBefore: input.scoreBefore,
    scoreAfter: input.scoreAfter,
    timeRemainingMs: input.timeRemainingMs,
    payload: input.payload,
  });
  if (result.errors?.length) throw new Error("No se pudo registrar el evento de actividad.");
}

export async function finishActivitySession(input: {
  sessionId: string;
  score: number;
  durationMs: number;
  completed: boolean;
  abandoned: boolean;
}): Promise<void> {
  const result = await client.models.ActivitySession.update({
    id: input.sessionId,
    finishedAt: new Date().toISOString(),
    durationMs: input.durationMs,
    score: input.score,
    completed: input.completed,
    abandoned: input.abandoned,
  });
  if (result.errors?.length) throw new Error("No se pudo cerrar la sesión de actividad.");
}
