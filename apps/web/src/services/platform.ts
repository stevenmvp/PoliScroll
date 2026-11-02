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
