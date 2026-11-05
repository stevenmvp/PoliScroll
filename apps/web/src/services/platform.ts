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

export async function updateUserProfileStatus(id: string, status: "active" | "suspended" | "pending"): Promise<void> {
  const result = await client.models.UserProfile.update({ id, status });
  if (result.errors?.length) throw new Error("No se pudo actualizar el estado del usuario.");
}

export async function deleteUserProfile(id: string): Promise<void> {
  const result = await client.models.UserProfile.delete({ id });
  if (result.errors?.length) throw new Error("No se pudo eliminar el registro del usuario.");
}

export async function listPublicProfiles(): Promise<Schema["PublicProfile"]["type"][]> {
  const result = await client.models.PublicProfile.list({ limit: 1000, filter: { isPublic: { eq: true } } });
  if (result.errors?.length) throw new Error("No se pudieron cargar los perfiles públicos.");
  return result.data.filter((profile) => profile.isPublic !== false);
}

export async function getOwnPublicProfile(userId: string): Promise<Schema["PublicProfile"]["type"] | undefined> {
  const result = await client.models.PublicProfile.list({ filter: { userId: { eq: userId } }, limit: 1 });
  if (result.errors?.length) throw new Error("No se pudo cargar tu perfil público.");
  return result.data[0];
}

export async function updatePublicProfile(input: {
  id: string;
  avatarUrl?: string;
  headline?: string;
  publicBio?: string;
  bannerUrl?: string;
  location?: string;
  currentStudyPlace?: string;
  isPublic: boolean;
}): Promise<void> {
  const result = await client.models.PublicProfile.update(input);
  if (result.errors?.length) throw new Error("No se pudo actualizar la información pública.");
}

export async function listProfileLinks(userId?: string): Promise<Schema["ProfileLink"]["type"][]> {
  const result = await client.models.ProfileLink.list(userId ? { filter: { userId: { eq: userId } }, limit: 1000 } : { limit: 1000 });
  if (result.errors?.length) throw new Error("No se pudieron cargar los enlaces del perfil.");
  return result.data.filter((link) => link.visibility !== "private");
}

export async function createProfileLink(input: {
  userId: string;
  label: string;
  url: string;
  icon: string;
  category: "social" | "professional" | "academic" | "portfolio";
}): Promise<void> {
  const result = await client.models.ProfileLink.create({ ...input, visibility: "public", sortOrder: 0 });
  if (result.errors?.length) throw new Error("No se pudo guardar el enlace.");
}

export async function listProfileHighlights(userId?: string): Promise<Schema["ProfileHighlight"]["type"][]> {
  const result = await client.models.ProfileHighlight.list(userId ? { filter: { userId: { eq: userId } }, limit: 1000 } : { limit: 1000 });
  if (result.errors?.length) throw new Error("No se pudieron cargar los logros y estudios.");
  return result.data.filter((item) => item.visibility !== "private");
}

export async function createProfileHighlight(input: {
  userId: string;
  kind: "achievement" | "study" | "experience";
  title: string;
  description?: string;
  organization?: string;
  icon: string;
}): Promise<void> {
  const result = await client.models.ProfileHighlight.create({ ...input, visibility: "public" });
  if (result.errors?.length) throw new Error("No se pudo guardar el elemento del perfil.");
}

export async function listProfilePosts(authorId?: string): Promise<Schema["ProfilePost"]["type"][]> {
  const result = await client.models.ProfilePost.list(authorId ? { filter: { authorId: { eq: authorId } }, limit: 1000 } : { limit: 1000 });
  if (result.errors?.length) throw new Error("No se pudieron cargar las publicaciones.");
  return result.data.filter((post) => post.status === "published");
}

export async function createProfilePost(input: {
  authorId: string;
  title: string;
  body: string;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "document" | "link";
}): Promise<void> {
  const result = await client.models.ProfilePost.create({
    ...input,
    status: "published",
    publishedAt: new Date().toISOString(),
  });
  if (result.errors?.length) throw new Error("No se pudo publicar en el perfil.");
}

export async function listAuditLogs(): Promise<Schema["AuditLog"]["type"][]> {
  const result = await client.models.AuditLog.list({ limit: 1000 });
  if (result.errors?.length) throw new Error("No se pudo cargar la auditoría.");
  return result.data;
}

export async function listSupportTickets(): Promise<Schema["SupportTicket"]["type"][]> {
  const result = await client.models.SupportTicket.list({ limit: 1000 });
  if (result.errors?.length) throw new Error("No se pudieron cargar los tickets de atención.");
  return result.data;
}

export async function createSupportTicket(input: {
  subject: string;
  description: string;
  requesterId: string;
  requesterEmail: string;
  category: "account" | "academic" | "technical" | "wellness" | "content" | "other";
}): Promise<void> {
  const now = new Date().toISOString();
  const result = await client.models.SupportTicket.create({ ...input, priority: "normal", status: "open", createdAt: now, updatedAt: now });
  if (result.errors?.length) throw new Error("No se pudo enviar tu solicitud.");
}

export async function updateSupportTicket(input: {
  id: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  assignedTo?: string;
  response?: string;
}): Promise<void> {
  const result = await client.models.SupportTicket.update({
    id: input.id,
    status: input.status,
    assignedTo: input.assignedTo,
    response: input.response,
    updatedAt: new Date().toISOString(),
  });
  if (result.errors?.length) throw new Error("No se pudo actualizar el ticket.");
}

export async function createTeacherApplication(input: {
  applicantId: string;
  applicantEmail: string;
  applicantName: string;
  institution?: string;
  academicProgram?: string;
  experience?: string;
}): Promise<void> {
  const result = await client.models.TeacherApplication.create({
    ...input,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  if (result.errors?.length) throw new Error("No se pudo enviar la solicitud docente.");
}

export async function listTeacherApplications(): Promise<Schema["TeacherApplication"]["type"][]> {
  const result = await client.models.TeacherApplication.list({ limit: 1000 });
  if (result.errors?.length) throw new Error("No se pudieron cargar las solicitudes docentes.");
  return result.data;
}

export async function updateTeacherApplicationStatus(id: string, status: "pending" | "approved" | "rejected", reviewerId: string): Promise<void> {
  const result = await client.models.TeacherApplication.update({
    id,
    status,
    reviewerId,
    updatedAt: new Date().toISOString(),
  });
  if (result.errors?.length) throw new Error("No se pudo actualizar la solicitud docente.");
}

export async function listActivitySessions(): Promise<Schema["ActivitySession"]["type"][]> {
  const result = await client.models.ActivitySession.list({ limit: 1000 });
  if (result.errors?.length) throw new Error("No se pudieron cargar las sesiones.");
  return result.data;
}

export async function listArcadeGameConfigs(): Promise<Schema["ArcadeGameConfig"]["type"][]> {
  const result = await client.models.ArcadeGameConfig.list({ limit: 1000 });
  if (result.errors?.length) throw new Error("No se pudo cargar la configuración del arcade.");
  return result.data;
}

export async function upsertArcadeGameConfig(input: {
  id?: string;
  gameId: string;
  enabled: boolean;
  difficulty: "facil" | "medio" | "experto";
  speedMultiplier: number;
  customTitle?: string;
  customInstruction?: string;
  educationalLevels: string[];
  frenzyEnabled: boolean;
  updatedBy: string;
}): Promise<void> {
  const payload = {
    gameId: input.gameId,
    enabled: input.enabled,
    difficulty: input.difficulty,
    speedMultiplier: input.speedMultiplier,
    customTitle: input.customTitle || undefined,
    customInstruction: input.customInstruction || undefined,
    educationalLevels: input.educationalLevels,
    frenzyEnabled: input.frenzyEnabled,
    updatedBy: input.updatedBy,
    updatedAt: new Date().toISOString(),
  };
  const result = input.id
    ? await client.models.ArcadeGameConfig.update({ id: input.id, ...payload })
    : await client.models.ArcadeGameConfig.create(payload);
  if (result.errors?.length) throw new Error("No se pudo guardar la configuración del juego.");
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

export async function markNotificationRead(id: string): Promise<void> {
  const result = await client.models.Notification.update({ id, readAt: new Date().toISOString() });
  if (result.errors?.length) throw new Error("No se pudo marcar la notificación como leída.");
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

export async function updateStudyGroupStatus(id: string, status: "active" | "archived" | "pending"): Promise<void> {
  const result = await client.models.StudyGroup.update({ id, status });
  if (result.errors?.length) throw new Error("No se pudo actualizar el estado del grupo.");
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
  coverImageUrl?: string;
  mediaLinks?: string[];
  sourceEventId?: string;
}): Promise<void> {
  const result = await client.models.NewsArticle.create({
    ...input,
    status: "published",
    publishedAt: new Date().toISOString(),
    version: 1,
  });
  if (result.errors?.length) throw new Error("No se pudo publicar la noticia.");
}

export async function archiveNewsArticle(id: string): Promise<void> {
  const result = await client.models.NewsArticle.update({ id, status: "archived" });
  if (result.errors?.length) throw new Error("No se pudo retirar la noticia.");
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
  modality: "Presencial" | "Virtual" | "Hibrido";
  durationWeeks?: number;
  capacity?: number;
  startsAt?: string;
  coverImageUrl?: string;
  resourceLinks?: string[];
  materialsDescription?: string;
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

export async function listCourseEnrollments(): Promise<Schema["CourseEnrollment"]["type"][]> {
  const result = await client.models.CourseEnrollment.list({ limit: 1000 });
  if (result.errors?.length) throw new Error("No se pudieron cargar las inscripciones.");
  return result.data;
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
  modality: "Presencial" | "Virtual" | "Hibrido";
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

export async function listTutoringBookings(): Promise<Schema["TutoringBooking"]["type"][]> {
  const result = await client.models.TutoringBooking.list({ limit: 1000 });
  if (result.errors?.length) throw new Error("No se pudieron cargar las solicitudes de tutoría.");
  return result.data;
}

export async function updateTutoringBookingStatus(
  id: string,
  status: "requested" | "confirmed" | "cancelled" | "completed",
): Promise<void> {
  const result = await client.models.TutoringBooking.update({ id, status });
  if (result.errors?.length) throw new Error("No se pudo actualizar el estado de la tutoría.");
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
