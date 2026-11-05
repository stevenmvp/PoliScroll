import { a, defineData, type ClientSchema } from "@aws-amplify/backend";
import { tutor } from "../functions/tutor/resource.js";

const schema = a.schema({
  UserProfile: a
    .model({
      userId: a.string(),
      displayName: a.string().required(),
      email: a.string().required(),
      avatarUrl: a.string(),
      role: a.enum(["student", "teacher", "admin", "super_admin"]),
      status: a.enum(["active", "suspended", "pending"]),
      educationalLevel: a.enum(["Primaria", "Secundaria", "Universitaria"]),
      institution: a.string(),
      academicProgram: a.string(),
      meetingUrl: a.string(),
      resourcesUrl: a.string(),
      interests: a.string().array(),
      headline: a.string(),
      publicBio: a.string(),
      bannerUrl: a.string(),
      location: a.string(),
      currentStudyPlace: a.string(),
      isPublic: a.boolean().default(true),
    })
    .authorization((allow) => [allow.owner(), allow.groups(["admin", "teacher"]) ]),

  PublicProfile: a
    .model({
      userId: a.string().required(),
      displayName: a.string().required(),
      role: a.enum(["student", "teacher"]),
      avatarUrl: a.string(),
      headline: a.string(),
      publicBio: a.string(),
      bannerUrl: a.string(),
      location: a.string(),
      currentStudyPlace: a.string(),
      isPublic: a.boolean().default(true),
    })
    .authorization((allow) => [allow.ownerDefinedIn("userId"), allow.authenticated().to(["read"]), allow.groups(["admin", "teacher"]) ]),

  ProfileLink: a
    .model({
      userId: a.string().required(),
      label: a.string().required(),
      url: a.string().required(),
      icon: a.string().required(),
      category: a.enum(["social", "professional", "academic", "portfolio"]),
      visibility: a.enum(["public", "private"]),
      sortOrder: a.integer().default(0),
    })
    .authorization((allow) => [allow.ownerDefinedIn("userId"), allow.authenticated().to(["read"]), allow.groups(["admin", "teacher"]) ]),

  ProfileHighlight: a
    .model({
      userId: a.string().required(),
      kind: a.enum(["achievement", "study", "experience"]),
      title: a.string().required(),
      description: a.string(),
      organization: a.string(),
      icon: a.string().required(),
      startedAt: a.string(),
      endedAt: a.string(),
      visibility: a.enum(["public", "private"]),
    })
    .authorization((allow) => [allow.ownerDefinedIn("userId"), allow.authenticated().to(["read"]), allow.groups(["admin", "teacher"]) ]),

  ProfilePost: a
    .model({
      authorId: a.string().required(),
      title: a.string().required(),
      body: a.string().required(),
      mediaUrl: a.string(),
      mediaType: a.enum(["image", "video", "document", "link"]),
      status: a.enum(["draft", "published", "archived"]),
      publishedAt: a.datetime(),
    })
    .authorization((allow) => [allow.ownerDefinedIn("authorId"), allow.authenticated().to(["read"]), allow.groups(["admin", "teacher"]) ]),

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

  ArcadeGameConfig: a
    .model({
      gameId: a.string().required(),
      enabled: a.boolean().required(),
      difficulty: a.enum(["facil", "medio", "experto"]),
      speedMultiplier: a.float(),
      customTitle: a.string(),
      customInstruction: a.string(),
      educationalLevels: a.string().array(),
      frenzyEnabled: a.boolean().required(),
      updatedBy: a.string().required(),
      updatedAt: a.datetime().required(),
    })
    .authorization((allow) => [
      allow.authenticated().to(["read"]),
      allow.groups(["admin"]),
    ]),

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
    .authorization((allow) => [allow.owner(), allow.authenticated().to(["read"]), allow.groups(["admin", "teacher"])]),

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
      coverImageUrl: a.string(),
      mediaLinks: a.string().array(),
      sourceEventId: a.string(),
    })
    .authorization((allow) => [allow.owner(), allow.authenticated().to(["read"]), allow.groups(["admin", "teacher"])]),

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
    .authorization((allow) => [allow.owner(), allow.authenticated().to(["read"]), allow.groups(["admin", "teacher"])]),

  Course: a
    .model({
      title: a.string().required(),
      description: a.string().required(),
      instructorId: a.string().required(),
      educationalLevel: a.enum(["Primaria", "Secundaria", "Universitaria"]),
      modality: a.enum(["Presencial", "Virtual", "Hibrido"]),
      durationWeeks: a.integer(),
      capacity: a.integer(),
      status: a.enum(["draft", "published", "closed"]),
      startsAt: a.datetime(),
      coverImageUrl: a.string(),
      resourceLinks: a.string().array(),
      materialsDescription: a.string(),
    })
    .authorization((allow) => [allow.owner(), allow.authenticated().to(["read"]), allow.groups(["admin", "teacher"])]),

  CourseEnrollment: a
    .model({
      courseId: a.string().required(),
      userId: a.string().required(),
      status: a.enum(["active", "completed", "cancelled"]),
      enrolledAt: a.datetime().required(),
    })
    .authorization((allow) => [allow.ownerDefinedIn("userId"), allow.groups(["admin", "teacher"])]),

  TutoringOffer: a
    .model({
      subject: a.string().required(),
      description: a.string().required(),
      tutorId: a.string().required(),
      availability: a.string().required(),
      modality: a.enum(["Presencial", "Virtual", "Hibrido"]),
      status: a.enum(["active", "paused", "closed"]),
    })
    .authorization((allow) => [allow.owner(), allow.authenticated().to(["read"]), allow.groups(["admin", "teacher"])]),

  TutoringBooking: a
    .model({
      offerId: a.string().required(),
      studentId: a.string().required(),
      scheduledAt: a.datetime().required(),
      status: a.enum(["requested", "confirmed", "cancelled", "completed"]),
      notes: a.string(),
      createdAt: a.datetime().required(),
    })
    .authorization((allow) => [allow.ownerDefinedIn("studentId"), allow.groups(["admin", "teacher"])]),

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
    .authorization((allow) => [allow.owner(), allow.ownerDefinedIn("studentId").to(["read"]), allow.groups(["admin", "teacher"])]),

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
    .authorization((allow) => [allow.groups(["admin"]), allow.groups(["teacher"]).to(["create"])]),

  SupportTicket: a
    .model({
      subject: a.string().required(),
      description: a.string().required(),
      requesterId: a.string().required(),
      requesterEmail: a.string().required(),
      category: a.enum(["account", "academic", "technical", "wellness", "content", "other"]),
      priority: a.enum(["low", "normal", "high", "urgent"]),
      status: a.enum(["open", "in_progress", "resolved", "closed"]),
      assignedTo: a.string(),
      response: a.string(),
      createdAt: a.datetime().required(),
      updatedAt: a.datetime().required(),
    })
    .authorization((allow) => [
      allow.ownerDefinedIn("requesterId"),
      allow.groups(["admin", "teacher"]),
    ]),

  TeacherApplication: a
    .model({
      applicantId: a.string().required(),
      applicantEmail: a.string().required(),
      applicantName: a.string().required(),
      institution: a.string(),
      academicProgram: a.string(),
      experience: a.string(),
      status: a.enum(["pending", "approved", "rejected"]),
      reviewerId: a.string(),
      reviewNotes: a.string(),
      createdAt: a.datetime().required(),
      updatedAt: a.datetime().required(),
    })
    .authorization((allow) => [allow.owner(), allow.groups(["admin"])]),

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
    .authorization((allow) => [allow.ownerDefinedIn("userId"), allow.groups(["admin", "teacher"]).to(["create"])]),

  tutorFeedback: a
    .query()
    .arguments({
      prompt: a.string().required(),
      context: a.string(),
    })
    .returns(a.customType({
      answer: a.string().required(),
    }))
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(tutor)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
