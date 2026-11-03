import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../amplify/data/resource";
import type { AuthSession, UserRole } from "../domain/identity";

const client = generateClient<Schema>();

export interface DashboardSummary {
  primaryLabel: string;
  primaryValue: number;
  secondaryLabel: string;
  secondaryValue: number;
  tertiaryLabel: string;
  tertiaryValue: number;
  pendingLabel: string;
  pendingValue: number;
}

export async function getDashboardSummary(session: AuthSession): Promise<DashboardSummary> {
  const role = session.user.role;
  if (role === "admin" || role === "super_admin") {
    const [profiles, news, events, audit] = await Promise.all([
      client.models.UserProfile.list({ limit: 1000 }),
      client.models.NewsArticle.list({ limit: 1000 }),
      client.models.CampusEvent.list({ limit: 1000 }),
      client.models.AuditLog.list({ limit: 1000 }),
    ]);
    return {
      primaryLabel: "Usuarios",
      primaryValue: profiles.data.length,
      secondaryLabel: "Publicaciones",
      secondaryValue: news.data.length,
      tertiaryLabel: "Eventos",
      tertiaryValue: events.data.length,
      pendingLabel: "Registros de auditoría",
      pendingValue: audit.data.length,
    };
  }

  if (role === "teacher") {
    const [groups, activities, grades, messages] = await Promise.all([
      client.models.StudyGroup.list({ limit: 1000 }),
      client.models.ActivitySession.list({ limit: 1000 }),
      client.models.GradeRecord.list({ limit: 1000 }),
      client.models.ChatMessage.list({ limit: 1000 }),
    ]);
    return {
      primaryLabel: "Grupos",
      primaryValue: groups.data.length,
      secondaryLabel: "Sesiones revisables",
      secondaryValue: activities.data.length,
      tertiaryLabel: "Calificaciones",
      tertiaryValue: grades.data.length,
      pendingLabel: "Mensajes",
      pendingValue: messages.data.length,
    };
  }

  const [activities, achievements, notifications, memberships] = await Promise.all([
    client.models.ActivitySession.list({ limit: 1000 }),
    client.models.UserAchievement.list({ limit: 1000 }),
    client.models.Notification.list({ limit: 1000 }),
    client.models.GroupMembership.list({ limit: 1000 }),
  ]);
  return {
    primaryLabel: "Actividades",
    primaryValue: activities.data.length,
    secondaryLabel: "Logros",
    secondaryValue: achievements.data.length,
    tertiaryLabel: "Grupos",
    tertiaryValue: memberships.data.length,
    pendingLabel: "Notificaciones",
    pendingValue: notifications.data.filter((notification) => !notification.readAt).length,
  };
}

export function dashboardRoleTitle(role: UserRole): string {
  if (role === "admin" || role === "super_admin") return "Centro de control";
  if (role === "teacher") return "Panel docente";
  return "Tu progreso";
}

export async function listUserProfiles(): Promise<Schema["UserProfile"]["type"][]> {
  const result = await client.models.UserProfile.list({ limit: 1000 });
  if (result.errors?.length) throw new Error("No se pudieron cargar los usuarios.");
  return result.data;
}

export async function listAuditLogs(): Promise<Schema["AuditLog"]["type"][]> {
  const result = await client.models.AuditLog.list({ limit: 1000 });
  if (result.errors?.length) throw new Error("No se pudo cargar la auditoría.");
  return result.data;
}

export async function listActivitySessions(): Promise<Schema["ActivitySession"]["type"][]> {
  const result = await client.models.ActivitySession.list({ limit: 1000 });
  if (result.errors?.length) throw new Error("No se pudieron cargar las sesiones.");
  return result.data;
}

export async function listGradeRecords(): Promise<Schema["GradeRecord"]["type"][]> {
  const result = await client.models.GradeRecord.list({ limit: 1000 });
  if (result.errors?.length) throw new Error("No se pudieron cargar las calificaciones.");
  return result.data;
}

export async function createGradeRecord(input: {
  studentId: string;
  teacherId: string;
  activityId?: string;
  score: number;
  maxScore: number;
  feedback?: string;
}): Promise<void> {
  const result = await client.models.GradeRecord.create({
    ...input,
    recordedAt: new Date().toISOString(),
  });
  if (result.errors?.length) throw new Error("No se pudo registrar la calificación.");
  const notification = await client.models.Notification.create({
    userId: input.studentId,
    title: "Nueva calificación disponible",
    body: input.feedback ?? `Obtuviste ${input.score} de ${input.maxScore}.`,
    type: "activity",
    createdAt: new Date().toISOString(),
  });
  if (notification.errors?.length) throw new Error("La calificación se guardó, pero no se pudo notificar al estudiante.");
}

export async function listNotifications(): Promise<Schema["Notification"]["type"][]> {
  const result = await client.models.Notification.list({ limit: 1000 });
  if (result.errors?.length) throw new Error("No se pudieron cargar las notificaciones.");
  return result.data;
}

export async function askTutor(prompt: string, context?: string): Promise<string> {
  const result = await client.queries.tutorFeedback({ prompt, context });
  if (result.errors?.length || !result.data?.answer) throw new Error("El tutor IA no está disponible en este momento.");
  return result.data.answer;
}

export async function listStudyGroups(): Promise<Schema["StudyGroup"]["type"][]> {
  const result = await client.models.StudyGroup.list({ limit: 1000 });
  if (result.errors?.length) throw new Error("No se pudieron cargar los grupos.");
  return result.data;
}

export async function createStudyGroup(input: {
  name: string;
  description: string;
  code: string;
  teacherId: string;
  educationalLevel: "Primaria" | "Secundaria" | "Universitaria";
}): Promise<void> {
  const result = await client.models.StudyGroup.create({
    ...input,
    status: "active",
  });
  if (result.errors?.length) throw new Error("No se pudo crear el grupo.");
}

export async function listNewsArticles(): Promise<Schema["NewsArticle"]["type"][]> {
  const result = await client.models.NewsArticle.list({ limit: 1000 });
  if (result.errors?.length) throw new Error("No se pudieron cargar las publicaciones.");
  return result.data;
}

export async function createNewsArticle(input: {
  title: string;
  summary: string;
  body: string;
  authorId: string;
}): Promise<void> {
  const result = await client.models.NewsArticle.create({
    ...input,
    status: "published",
    publishedAt: new Date().toISOString(),
    version: 1,
  });
  if (result.errors?.length) throw new Error("No se pudo publicar la noticia.");
}

export async function listCampusEvents(): Promise<Schema["CampusEvent"]["type"][]> {
  const result = await client.models.CampusEvent.list({ limit: 1000 });
  if (result.errors?.length) throw new Error("No se pudieron cargar los eventos.");
  return result.data;
}

export async function createCampusEvent(input: {
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt?: string;
  organizerId: string;
  capacity?: number;
}): Promise<void> {
  const result = await client.models.CampusEvent.create({
    ...input,
    status: "published",
  });
  if (result.errors?.length) throw new Error("No se pudo crear el evento.");
}

export async function listCourses(): Promise<Schema["Course"]["type"][]> {
  const result = await client.models.Course.list({ filter: { status: { eq: "published" } }, limit: 1000 });
  if (result.errors?.length) throw new Error("No se pudieron cargar los cursos.");
  return result.data;
}

export async function createCourse(input: {
  title: string;
  description: string;
  instructorId: string;
  educationalLevel: "Primaria" | "Secundaria" | "Universitaria";
  modality: "Presencial" | "Virtual" | "Híbrido";
  durationWeeks?: number;
  capacity?: number;
  startsAt?: string;
}): Promise<void> {
  const result = await client.models.Course.create({ ...input, status: "published" });
  if (result.errors?.length) throw new Error("No se pudo publicar el curso.");
}

export async function enrollInCourse(courseId: string, userId: string): Promise<void> {
  const result = await client.models.CourseEnrollment.create({
    courseId,
    userId,
    status: "active",
    enrolledAt: new Date().toISOString(),
  });
  if (result.errors?.length) throw new Error("No se pudo registrar la inscripción al curso.");
}

export async function listTutoringOffers(): Promise<Schema["TutoringOffer"]["type"][]> {
  const result = await client.models.TutoringOffer.list({ filter: { status: { eq: "active" } }, limit: 1000 });
  if (result.errors?.length) throw new Error("No se pudieron cargar las tutorías.");
  return result.data;
}

export async function createTutoringOffer(input: {
  subject: string;
  description: string;
  tutorId: string;
  availability: string;
  modality: "Presencial" | "Virtual" | "Híbrido";
}): Promise<void> {
  const result = await client.models.TutoringOffer.create({ ...input, status: "active" });
  if (result.errors?.length) throw new Error("No se pudo publicar la oferta de tutoría.");
}

export async function bookTutoring(input: {
  offerId: string;
  studentId: string;
  scheduledAt: string;
  notes?: string;
}): Promise<void> {
  const result = await client.models.TutoringBooking.create({
    ...input,
    status: "requested",
    createdAt: new Date().toISOString(),
  });
  if (result.errors?.length) throw new Error("No se pudo solicitar la tutoría.");
}

export async function findStudyGroupByCode(code: string): Promise<Schema["StudyGroup"]["type"] | null> {
  const result = await client.models.StudyGroup.list({
    filter: { code: { eq: code.trim().toUpperCase() }, status: { eq: "active" } },
    limit: 1,
  });
  if (result.errors?.length) throw new Error("No se pudo buscar el grupo.");
  return result.data[0] ?? null;
}

export async function joinStudyGroup(groupId: string, userId: string): Promise<void> {
  const result = await client.models.GroupMembership.create({
    groupId,
    userId,
    role: "student",
    status: "active",
    joinedAt: new Date().toISOString(),
  });
  if (result.errors?.length) throw new Error("No se pudo completar la inscripción.");
}

export async function createChatConversation(input: {
  title: string;
  createdBy: string;
}): Promise<string> {
  const result = await client.models.ChatConversation.create({
    title: input.title,
    kind: "support",
    createdBy: input.createdBy,
    lastMessageAt: new Date().toISOString(),
    archived: false,
  });
  if (result.errors?.length || !result.data?.id) throw new Error("No se pudo iniciar el chat.");
  const participant = await client.models.ChatParticipant.create({
    conversationId: result.data.id,
    userId: input.createdBy,
    joinedAt: new Date().toISOString(),
    lastReadAt: new Date().toISOString(),
    muted: false,
  });
  if (participant.errors?.length) throw new Error("La conversación se creó, pero no se pudo registrar al participante.");
  return result.data.id;
}

export async function sendChatMessage(input: {
  conversationId: string;
  senderId: string;
  body: string;
}): Promise<void> {
  const sentAt = new Date().toISOString();
  const result = await client.models.ChatMessage.create({
    ...input,
    sentAt,
  });
  if (result.errors?.length) throw new Error("No se pudo enviar el mensaje.");
  const conversation = await client.models.ChatConversation.get({ id: input.conversationId });
  if (conversation.data) {
    const updated = await client.models.ChatConversation.update({
      id: input.conversationId,
      lastMessageAt: sentAt,
    });
    if (updated.errors?.length) throw new Error("El mensaje se guardó, pero no se pudo actualizar la conversación.");
  }
}

export async function markChatRead(conversationId: string, userId: string): Promise<void> {
  const result = await client.models.ChatParticipant.list({
    filter: { conversationId: { eq: conversationId }, userId: { eq: userId } },
    limit: 1,
  });
  if (result.errors?.length) throw new Error("No se pudo consultar la participación del chat.");
  const participant = result.data[0];
  if (!participant) return;
  const updated = await client.models.ChatParticipant.update({
    id: participant.id,
    lastReadAt: new Date().toISOString(),
  });
  if (updated.errors?.length) throw new Error("No se pudo marcar el chat como leído.");
}
