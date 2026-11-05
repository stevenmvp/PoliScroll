import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../amplify/data/resource";
import { getCurrentUser } from "aws-amplify/auth";
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

export const TUTOR_SENDER_ID = "poliscroll-tutor";

export async function recordAudit(action: string, entityType: string, entityId?: string, before?: unknown, after?: unknown): Promise<void> {
  try {
    const actor = await getCurrentUser();
    const result = await client.models.AuditLog.create({
      actorId: actor.userId,
      action,
      entityType,
      entityId,
      before: before === undefined ? undefined : JSON.stringify(before),
      after: after === undefined ? undefined : JSON.stringify(after),
      createdAt: new Date().toISOString(),
    });
    if (result.errors?.length) console.warn("No se pudo registrar la auditoría.", action);
  } catch (error) {
    console.warn("No se pudo registrar la auditoría.", action, error);
  }
}

async function recordContentVersion(entityType: string, entityId: string, snapshot: unknown, summary: string): Promise<void> {
  try {
    const actor = await getCurrentUser();
    const existing = await client.models.ContentVersion.list({ filter: { entityId: { eq: entityId } }, limit: 1000 });
    const version = existing.data.reduce((max, item) => Math.max(max, item.version), 0) + 1;
    await client.models.ContentVersion.create({ entityType, entityId, version, snapshot: JSON.stringify(snapshot), changedBy: actor.userId, changeSummary: summary, createdAt: new Date().toISOString() });
  } catch (error) {
    console.warn("No se pudo guardar la versión del contenido.", entityType, error);
  }
}

export async function updateUserProfileStatus(id: string, status: "active" | "suspended" | "pending"): Promise<void> {
  const before = await client.models.UserProfile.get({ id });
  const result = await client.models.UserProfile.update({ id, status });
  if (result.errors?.length) throw new Error("No se pudo actualizar el estado del usuario.");
  await recordAudit("user.status_changed", "UserProfile", id, { status: before.data?.status, email: before.data?.email }, { status });
}

export async function deleteUserProfile(id: string): Promise<void> {
  const before = await client.models.UserProfile.get({ id });
  const ownerId = before.data?.userId;
  if (ownerId) await purgeUserData(ownerId);
  const result = await client.models.UserProfile.delete({ id });
  if (result.errors?.length) throw new Error("No se pudo eliminar el registro del usuario.");
  await recordAudit("user.deleted", "UserProfile", id, { email: before.data?.email, role: before.data?.role, status: before.data?.status });
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
  const ticket = await client.models.SupportTicket.get({ id: input.id });
  const result = await client.models.SupportTicket.update({
    id: input.id,
    status: input.status,
    assignedTo: input.assignedTo,
    response: input.response,
    updatedAt: new Date().toISOString(),
  });
  if (result.errors?.length) throw new Error("No se pudo actualizar el ticket.");
  await recordAudit("support_ticket.updated", "SupportTicket", input.id, { status: ticket.data?.status, assignedTo: ticket.data?.assignedTo }, { status: input.status, assignedTo: input.assignedTo, responded: Boolean(input.response) });
  const requesterId = ticket.data?.requesterId;
  if (requesterId && (input.response || ticket.data?.status !== input.status)) {
    try {
      await notifyUsers([requesterId], { title: input.response ? "Respondieron tu solicitud" : "Tu solicitud cambió de estado", body: input.response ?? `${ticket.data?.subject}: ahora está "${input.status}".`, type: "message", actionUrl: "#module/ayuda" });
    } catch {
      // El ticket ya se actualizó; el aviso es secundario.
    }
  }
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
  const before = await client.models.TeacherApplication.get({ id });
  const result = await client.models.TeacherApplication.update({
    id,
    status,
    reviewerId,
    updatedAt: new Date().toISOString(),
  });
  if (result.errors?.length) throw new Error("No se pudo actualizar la solicitud docente.");
  await recordAudit("teacher_application.reviewed", "TeacherApplication", id, { status: before.data?.status }, { status, reviewerId });
  if (before.data?.applicantId && status !== "pending") {
    try {
      await notifyUsers([before.data.applicantId], { title: status === "approved" ? "Solicitud docente aprobada" : "Solicitud docente rechazada", body: status === "approved" ? "Un administrador aprobó tu solicitud. Vuelve a iniciar sesión para ver los cambios." : "Un administrador revisó tu solicitud y no fue aprobada.", type: "system" });
    } catch {
      // La revisión ya quedó registrada.
    }
  }
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
  const before = input.id ? await client.models.ArcadeGameConfig.get({ id: input.id }) : undefined;
  const result = input.id
    ? await client.models.ArcadeGameConfig.update({ id: input.id, ...payload })
    : await client.models.ArcadeGameConfig.create(payload);
  if (result.errors?.length) throw new Error("No se pudo guardar la configuración del juego.");
  await recordAudit(input.id ? "arcade_config.updated" : "arcade_config.created", "ArcadeGameConfig", result.data?.id ?? input.id, before?.data ? { enabled: before.data.enabled, difficulty: before.data.difficulty, speedMultiplier: before.data.speedMultiplier, frenzyEnabled: before.data.frenzyEnabled } : undefined, { gameId: payload.gameId, enabled: payload.enabled, difficulty: payload.difficulty, speedMultiplier: payload.speedMultiplier, frenzyEnabled: payload.frenzyEnabled });
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
  await recordAudit("grade.recorded", "GradeRecord", result.data?.id, undefined, { studentId: input.studentId, activityId: input.activityId, score: input.score, maxScore: input.maxScore });
  await awardAchievement(input.studentId, { key: "first-grade", title: "Primera calificación", description: "Recibiste tu primera calificación en PoliScroll.", icon: "★", points: 10 }, input.activityId);
  if (input.maxScore > 0 && input.score / input.maxScore >= 0.9) {
    await awardAchievement(input.studentId, { key: "high-score", title: "Excelencia", description: "Obtuviste 90% o más en una actividad.", icon: "✦", points: 25 }, input.activityId);
  }
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
  await recordAudit("study_group.created", "StudyGroup", result.data?.id, undefined, { name: input.name, code: input.code, teacherId: input.teacherId });
}

export async function updateStudyGroupStatus(id: string, status: "active" | "archived" | "pending"): Promise<void> {
  const before = await client.models.StudyGroup.get({ id });
  const result = await client.models.StudyGroup.update({ id, status });
  if (result.errors?.length) throw new Error("No se pudo actualizar el estado del grupo.");
  await recordAudit("study_group.status_changed", "StudyGroup", id, { status: before.data?.status }, { status });
}

export async function listNewsArticles(): Promise<Schema["NewsArticle"]["type"][]> {
  const result = await client.models.NewsArticle.list({ limit: 1000 });
  if (result.errors?.length) throw new Error("No se pudieron cargar las publicaciones.");
  return result.data;
}

type NotificationKind = "system" | "activity" | "message" | "event";

export async function notifyUsers(userIds: string[], input: { title: string; body: string; type: NotificationKind; actionUrl?: string }): Promise<number> {
  const createdAt = new Date().toISOString();
  const unique = [...new Set(userIds)];
  let sent = 0;
  for (let index = 0; index < unique.length; index += 20) {
    const results = await Promise.allSettled(unique.slice(index, index + 20).map((userId) => client.models.Notification.create({ userId, createdAt, ...input })));
    sent += results.filter((result) => result.status === "fulfilled" && !result.value.errors?.length).length;
  }
  return sent;
}

// Recorre todas las páginas de perfiles públicos para no limitar el alcance de los avisos.
async function listAllPublicProfileIds(): Promise<string[]> {
  const ids: string[] = [];
  let nextToken: string | null | undefined;
  do {
    const page = await client.models.PublicProfile.list({ limit: 1000, nextToken });
    if (page.errors?.length) throw new Error("No se pudieron listar los destinatarios.");
    ids.push(...page.data.map((profile) => profile.userId));
    nextToken = page.nextToken;
  } while (nextToken);
  return ids;
}

async function notifyCommunity(input: { title: string; body: string; type: NotificationKind; actionUrl?: string }, excludeUserId: string): Promise<void> {
  try {
    const recipients = (await listAllPublicProfileIds()).filter((userId) => userId !== excludeUserId);
    const sent = await notifyUsers(recipients, input);
    await recordAudit("notification.broadcast", "Notification", undefined, undefined, { title: input.title, recipients: recipients.length, sent });
  } catch {
    // La publicación ya se guardó; un fallo al avisar no debe revertirla.
  }
}

export async function createNewsArticle(input: {
  title: string;
  summary: string;
  body: string;
  authorId: string;
  coverImageUrl?: string;
  mediaLinks?: string[];
  sourceEventId?: string;
}, options: { notify?: boolean } = {}): Promise<void> {
  const result = await client.models.NewsArticle.create({
    ...input,
    status: "published",
    publishedAt: new Date().toISOString(),
    version: 1,
  });
  if (result.errors?.length) throw new Error("No se pudo publicar la noticia.");
  if (result.data?.id) {
    await recordContentVersion("NewsArticle", result.data.id, { title: input.title, summary: input.summary, body: input.body, coverImageUrl: input.coverImageUrl, mediaLinks: input.mediaLinks }, "Publicación inicial");
    await recordAudit("news.published", "NewsArticle", result.data.id, undefined, { title: input.title, authorId: input.authorId });
  }
  if (options.notify) await notifyCommunity({ title: "Nueva noticia", body: input.title, type: "system", actionUrl: "#module/noticias" }, input.authorId);
}

export async function archiveNewsArticle(id: string): Promise<void> {
  const before = await client.models.NewsArticle.get({ id });
  const result = await client.models.NewsArticle.update({ id, status: "archived" });
  if (result.errors?.length) throw new Error("No se pudo retirar la noticia.");
  await recordAudit("news.archived", "NewsArticle", id, { status: before.data?.status, title: before.data?.title }, { status: "archived" });
  if (before.data) await recordContentVersion("NewsArticle", id, { title: before.data.title, summary: before.data.summary, body: before.data.body, status: "archived" }, "Noticia retirada");
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
  await recordAudit("campus_event.created", "CampusEvent", result.data?.id, undefined, { title: input.title, startsAt: input.startsAt, organizerId: input.organizerId });
  await notifyCommunity({ title: "Nuevo evento en el campus", body: `${input.title} · ${new Date(input.startsAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}`, type: "event", actionUrl: "#module/actividades" }, input.organizerId);
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
  await recordAudit("course.published", "Course", result.data?.id, undefined, { title: input.title, instructorId: input.instructorId });
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
  const before = await client.models.TutoringBooking.get({ id });
  const result = await client.models.TutoringBooking.update({ id, status });
  if (result.errors?.length) throw new Error("No se pudo actualizar el estado de la tutoría.");
  await recordAudit("tutoring_booking.status_changed", "TutoringBooking", id, { status: before.data?.status }, { status });
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

export interface ChatHistory {
  conversationId: string;
  messages: Array<{ body: string; fromUser: boolean }>;
}

export async function loadChatHistory(userId: string): Promise<ChatHistory | null> {
  const conversations = await client.models.ChatConversation.list({ filter: { createdBy: { eq: userId }, kind: { eq: "support" } }, limit: 1000 });
  if (conversations.errors?.length) throw new Error("No se pudo cargar tu conversación.");
  const latest = conversations.data.filter((item) => item.archived !== true).sort((a, b) => (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""))[0];
  if (!latest) return null;
  const messages = await client.models.ChatMessage.list({ filter: { conversationId: { eq: latest.id } }, limit: 1000 });
  if (messages.errors?.length) throw new Error("No se pudo cargar el historial del chat.");
  return {
    conversationId: latest.id,
    messages: messages.data.filter((item) => !item.deletedAt).sort((a, b) => a.sentAt.localeCompare(b.sentAt)).map((item) => ({ body: item.body, fromUser: item.senderId !== TUTOR_SENDER_ID })),
  };
}

export async function recordTutorExchange(input: { conversationId: string; userId: string; prompt: string; response: string }): Promise<void> {
  const sessions = await client.models.AISession.list({ filter: { userId: { eq: input.userId }, context: { eq: input.conversationId } }, limit: 1 });
  if (sessions.errors?.length) throw new Error("No se pudo consultar la sesión del tutor.");
  let sessionId = sessions.data[0]?.id;
  if (!sessionId) {
    const created = await client.models.AISession.create({ userId: input.userId, context: input.conversationId, topic: "PoliChat", startedAt: new Date().toISOString(), model: "gemini-2.0-flash", status: "active" });
    if (created.errors?.length || !created.data?.id) throw new Error("No se pudo registrar la sesión del tutor.");
    sessionId = created.data.id;
  }
  await sendChatMessage({ conversationId: input.conversationId, senderId: TUTOR_SENDER_ID, body: input.response });
  const feedback = await client.models.AIFeedback.create({ sessionId, userId: input.userId, prompt: input.prompt, response: input.response, createdAt: new Date().toISOString() });
  if (feedback.errors?.length) throw new Error("No se pudo registrar la respuesta del tutor.");
}

// Elimina los datos dependientes de un usuario para no dejar registros huérfanos.
async function purgeUserData(userId: string): Promise<void> {
  const [publicProfiles, notes, notifications, earned] = await Promise.all([
    client.models.PublicProfile.list({ filter: { userId: { eq: userId } }, limit: 1000 }),
    client.models.AcademicNote.list({ filter: { userId: { eq: userId } }, limit: 1000 }),
    client.models.Notification.list({ filter: { userId: { eq: userId } }, limit: 1000 }),
    client.models.UserAchievement.list({ filter: { userId: { eq: userId } }, limit: 1000 }),
  ]);
  await Promise.all([
    ...publicProfiles.data.map((row) => client.models.PublicProfile.delete({ id: row.id })),
    ...notes.data.map((row) => client.models.AcademicNote.delete({ id: row.id })),
    ...notifications.data.map((row) => client.models.Notification.delete({ id: row.id })),
    ...earned.data.map((row) => client.models.UserAchievement.delete({ id: row.id })),
  ]);
  await recordAudit("user.data_purged", "UserProfile", userId, undefined, {
    publicProfiles: publicProfiles.data.length, notes: notes.data.length, notifications: notifications.data.length, achievements: earned.data.length,
  });
}

export async function loadServerNotificationPrefs(email: string): Promise<Record<string, boolean> | null> {
  const result = await client.models.UserProfile.list({ filter: { email: { eq: email } }, limit: 1 });
  const raw = result.data[0]?.notificationPrefs;
  if (!raw) return null;
  try { return JSON.parse(raw) as Record<string, boolean>; } catch { return null; }
}

export async function saveServerNotificationPrefs(email: string, prefs: Record<string, boolean>): Promise<void> {
  const result = await client.models.UserProfile.list({ filter: { email: { eq: email } }, limit: 1 });
  const profile = result.data[0];
  if (!profile) throw new Error("No se encontró tu perfil.");
  const updated = await client.models.UserProfile.update({ id: profile.id, notificationPrefs: JSON.stringify(prefs) });
  if (updated.errors?.length) throw new Error("No se pudieron guardar tus preferencias.");
}

export interface AchievementDefinition { key: string; title: string; description?: string; icon?: string; points?: number }

// Otorga un logro una sola vez por usuario; es de mejor esfuerzo y nunca bloquea la acción original.
export async function awardAchievement(userId: string, definition: AchievementDefinition, sourceActivityId?: string): Promise<void> {
  try {
    const catalog = await client.models.Achievement.list({ filter: { key: { eq: definition.key } }, limit: 1 });
    const achievement = catalog.data[0] ?? (await client.models.Achievement.create({ ...definition, active: true })).data;
    if (!achievement) return;
    const existing = await client.models.UserAchievement.list({ filter: { userId: { eq: userId }, achievementId: { eq: achievement.id } }, limit: 1 });
    if (existing.data.length) return;
    await client.models.UserAchievement.create({ userId, achievementId: achievement.id, earnedAt: new Date().toISOString(), sourceActivityId });
    await client.models.Notification.create({ userId, title: `Logro: ${definition.title}`, body: definition.description ?? "Desbloqueaste un nuevo logro.", type: "activity", createdAt: new Date().toISOString() });
  } catch (error) {
    console.warn("No se pudo otorgar el logro.", error);
  }
}

export interface EarnedAchievement { id: string; title: string; description?: string | null; icon?: string | null; points?: number | null; earnedAt: string }

export async function listMyAchievements(userId: string): Promise<EarnedAchievement[]> {
  const [earned, catalog] = await Promise.all([
    client.models.UserAchievement.list({ filter: { userId: { eq: userId } }, limit: 1000 }),
    client.models.Achievement.list({ limit: 1000 }),
  ]);
  if (earned.errors?.length) throw new Error("No se pudieron cargar tus logros.");
  const byId = new Map(catalog.data.map((item) => [item.id, item]));
  return earned.data.flatMap((row) => {
    const item = byId.get(row.achievementId);
    return item ? [{ id: row.id, title: item.title, description: item.description, icon: item.icon, points: item.points, earnedAt: row.earnedAt }] : [];
  }).sort((a, b) => b.earnedAt.localeCompare(a.earnedAt));
}

export async function listAcademicNotes(userId: string): Promise<Schema["AcademicNote"]["type"][]> {
  const result = await client.models.AcademicNote.list({ filter: { userId: { eq: userId }, archived: { ne: true } }, limit: 1000 });
  if (result.errors?.length) throw new Error("No se pudieron cargar tus notas.");
  return result.data.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
}

export async function saveAcademicNote(input: { id?: string; userId: string; title: string; content: string; subject?: string }): Promise<void> {
  if (input.id) {
    const current = await client.models.AcademicNote.get({ id: input.id });
    const result = await client.models.AcademicNote.update({ id: input.id, title: input.title, content: input.content, subject: input.subject, version: (current.data?.version ?? 1) + 1 });
    if (result.errors?.length) throw new Error("No se pudo actualizar la nota.");
    return;
  }
  const result = await client.models.AcademicNote.create({ userId: input.userId, title: input.title, content: input.content, subject: input.subject, version: 1, archived: false });
  if (result.errors?.length) throw new Error("No se pudo guardar la nota.");
}

export async function archiveAcademicNote(id: string): Promise<void> {
  const result = await client.models.AcademicNote.update({ id, archived: true });
  if (result.errors?.length) throw new Error("No se pudo archivar la nota.");
}

export interface CatalogEntry { createdBy?: string; slug: string; title: string; description: string; meta?: string; tag?: string; available?: boolean }

export async function createCatalogItem(module: string, entry: CatalogEntry): Promise<string> {
  const result = await client.models.CatalogItem.create({ module, ...entry, active: true, sortOrder: Date.now() % 1_000_000_000 });
  if (result.errors?.length || !result.data) throw new Error("No se pudo guardar la actividad.");
  await recordAudit("catalog.created", "CatalogItem", result.data.id, undefined, { module, title: entry.title });
  return result.data.id;
}

export async function updateCatalogItem(id: string, changes: { title?: string; description?: string; meta?: string; tag?: string; available?: boolean; active?: boolean }): Promise<void> {
  const before = await client.models.CatalogItem.get({ id });
  const result = await client.models.CatalogItem.update({ id, ...changes });
  if (result.errors?.length) throw new Error("No se pudo actualizar el elemento del catálogo.");
  await recordAudit(changes.active === false ? "catalog.archived" : "catalog.updated", "CatalogItem", id, { title: before.data?.title, tag: before.data?.tag, available: before.data?.available, active: before.data?.active }, changes);
}

export async function listAllCatalogItems(): Promise<Schema["CatalogItem"]["type"][]> {
  const result = await client.models.CatalogItem.list({ limit: 1000 });
  if (result.errors?.length) throw new Error("No se pudo cargar el catálogo del campus.");
  return result.data.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function listCatalogItems(): Promise<Schema["CatalogItem"]["type"][]> {
  const result = await client.models.CatalogItem.list({ limit: 1000, filter: { active: { ne: false } } });
  if (result.errors?.length) throw new Error("No se pudo cargar el catálogo del campus.");
  return result.data.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

// Siembra el catálogo una sola vez; solo corre si la tabla está vacía y el usuario puede escribir.
export async function seedCatalogItems(entries: Record<string, CatalogEntry[]>): Promise<void> {
  const existing = await client.models.CatalogItem.list({ limit: 1 });
  if (existing.errors?.length || existing.data.length) return;
  let order = 0;
  for (const [module, items] of Object.entries(entries)) {
    for (const item of items) {
      await client.models.CatalogItem.create({ module, ...item, sortOrder: order++, active: true });
    }
  }
  await recordAudit("catalog.seeded", "CatalogItem", undefined, undefined, { modules: Object.keys(entries) });
}
