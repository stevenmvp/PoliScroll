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

  StudyGroup: a
    .model({
      name: a.string().required(),
      description: a.string(),
      code: a.string().required(),
      teacherId: a.string().required(),
      status: a.enum(["active", "archived", "pending"]),
      educationalLevel: a.enum(["Primaria", "Secundaria", "Universitaria"]),
      academicProgram: a.string(),
    })
    .authorization((allow) => [allow.owner(), allow.groups(["admin", "teacher"])]),

  GroupMembership: a
    .model({
      groupId: a.string().required(),
      userId: a.string().required(),
      role: a.enum(["student", "teacher", "coordinator"]),
      status: a.enum(["active", "invited", "removed"]),
      joinedAt: a.datetime().required(),
    })
    .authorization((allow) => [allow.owner(), allow.groups(["admin", "teacher"])]),

  NewsArticle: a
    .model({
      title: a.string().required(),
      summary: a.string(),
      body: a.string().required(),
      authorId: a.string().required(),
      status: a.enum(["draft", "published", "archived"]),
      publishedAt: a.datetime(),
      tags: a.string().array(),
      version: a.integer().default(1),
    })
    .authorization((allow) => [allow.owner(), allow.groups(["admin", "teacher"])]),

  CampusEvent: a
    .model({
      title: a.string().required(),
      description: a.string(),
      location: a.string(),
      startsAt: a.datetime().required(),
      endsAt: a.datetime(),
      organizerId: a.string().required(),
      status: a.enum(["draft", "published", "cancelled"]),
      capacity: a.integer(),
    })
    .authorization((allow) => [allow.owner(), allow.groups(["admin", "teacher"])]),

  ChatConversation: a
    .model({
      title: a.string(),
      kind: a.enum(["direct", "group", "support"]),
      createdBy: a.string().required(),
      lastMessageAt: a.datetime(),
      archived: a.boolean().default(false),
    })
    .authorization((allow) => [allow.owner(), allow.groups(["admin", "teacher"])]),

  ChatParticipant: a
    .model({
      conversationId: a.string().required(),
      userId: a.string().required(),
      joinedAt: a.datetime().required(),
      lastReadAt: a.datetime(),
      muted: a.boolean().default(false),
    })
    .authorization((allow) => [allow.owner(), allow.groups(["admin", "teacher"])]),

  ChatMessage: a
    .model({
      conversationId: a.string().required(),
      senderId: a.string().required(),
      body: a.string().required(),
      sentAt: a.datetime().required(),
      editedAt: a.datetime(),
      deletedAt: a.datetime(),
      attachmentUrl: a.string(),
    })
    .authorization((allow) => [allow.owner(), allow.groups(["admin", "teacher"])]),

  AISession: a
    .model({
      userId: a.string().required(),
      context: a.string(),
      topic: a.string(),
      startedAt: a.datetime().required(),
      endedAt: a.datetime(),
      model: a.string(),
      tokenCount: a.integer(),
      status: a.enum(["active", "completed", "failed"]),
    })
    .authorization((allow) => [allow.owner(), allow.groups(["admin", "teacher"])]),

  AIFeedback: a
    .model({
      sessionId: a.string().required(),
      userId: a.string().required(),
      prompt: a.string().required(),
      response: a.string().required(),
      rating: a.integer(),
      sourceReferences: a.string().array(),
      createdAt: a.datetime().required(),
    })
    .authorization((allow) => [allow.owner(), allow.groups(["admin", "teacher"])]),

  AcademicNote: a
    .model({
      userId: a.string().required(),
      title: a.string().required(),
      content: a.string().required(),
      subject: a.string(),
      tags: a.string().array(),
      version: a.integer().default(1),
      archived: a.boolean().default(false),
    })
    .authorization((allow) => [allow.owner(), allow.groups(["admin", "teacher"])]),

  GradeRecord: a
    .model({
      studentId: a.string().required(),
      teacherId: a.string().required(),
      groupId: a.string(),
      activityId: a.string(),
      score: a.float().required(),
      maxScore: a.float().required(),
      feedback: a.string(),
      recordedAt: a.datetime().required(),
    })
    .authorization((allow) => [allow.owner(), allow.groups(["admin", "teacher"])]),

  Achievement: a
    .model({
      key: a.string().required(),
      title: a.string().required(),
      description: a.string(),
      icon: a.string(),
      points: a.integer().default(0),
      active: a.boolean().default(true),
    })
    .authorization((allow) => [allow.owner(), allow.groups(["admin", "teacher"])]),

  UserAchievement: a
    .model({
      userId: a.string().required(),
      achievementId: a.string().required(),
      earnedAt: a.datetime().required(),
      sourceActivityId: a.string(),
    })
    .authorization((allow) => [allow.owner(), allow.groups(["admin", "teacher"])]),

  AuditLog: a
    .model({
      actorId: a.string().required(),
      action: a.string().required(),
      entityType: a.string().required(),
      entityId: a.string(),
      before: a.json(),
      after: a.json(),
      createdAt: a.datetime().required(),
      ipHash: a.string(),
    })
    .authorization((allow) => [allow.groups(["admin"])]),

  ContentVersion: a
    .model({
      entityType: a.string().required(),
      entityId: a.string().required(),
      version: a.integer().required(),
      snapshot: a.json().required(),
      changedBy: a.string().required(),
      changeSummary: a.string(),
      createdAt: a.datetime().required(),
    })
    .authorization((allow) => [allow.groups(["admin", "teacher"])]),

  Notification: a
    .model({
      userId: a.string().required(),
      title: a.string().required(),
      body: a.string().required(),
      type: a.enum(["system", "activity", "message", "event"]),
      readAt: a.datetime(),
      createdAt: a.datetime().required(),
      actionUrl: a.string(),
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
