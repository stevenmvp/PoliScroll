import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

const schema = a.schema({
  UserProfile: a
    .model({
      displayName: a.string().required(),
      email: a.string().required(),
      avatarUrl: a.string(),
      role: a.enum(["student", "teacher", "admin", "super_admin"]),
      status: a.enum(["active", "suspended", "pending"]),
      educationalLevel: a.enum(["Primaria", "Secundaria", "Universitaria"]),
      institution: a.string(),
      academicProgram: a.string(),
      interests: a.string().array(),
    })
    .authorization((allow) => [allow.owner(), allow.groups(["admin", "teacher"])]),

  ActivitySession: a
    .model({
      activityId: a.string().required(),
      activityTitle: a.string().required(),
      educationalLevel: a.enum(["Primaria", "Secundaria", "Universitaria"]),
      topic: a.string(),
      startedAt: a.datetime().required(),
      finishedAt: a.datetime(),
      durationMs: a.integer(),
      score: a.integer().default(0),
      completed: a.boolean().default(false),
      abandoned: a.boolean().default(false),
    })
    .authorization((allow) => [allow.owner(), allow.groups(["admin", "teacher"])]),

  ActivityEvent: a
    .model({
      sessionId: a.string().required(),
      activityId: a.string().required(),
      gameId: a.string(),
      eventType: a.string().required(),
      stage: a.integer(),
      timestamp: a.datetime().required(),
      scoreBefore: a.integer(),
      scoreAfter: a.integer(),
      timeRemainingMs: a.integer(),
      payload: a.json(),
    })
    .authorization((allow) => [allow.owner(), allow.groups(["admin", "teacher"])]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
