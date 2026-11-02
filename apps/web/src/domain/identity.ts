export type EducationalLevel = "Primaria" | "Secundaria" | "Universitaria";

export type UserRole = "student" | "teacher" | "admin" | "super_admin";

export type AccountStatus = "active" | "suspended" | "pending";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  status: AccountStatus;
  educationalLevel?: EducationalLevel;
  institution?: string;
  academicProgram?: string;
  interests: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: UserProfile;
  expiresAt: string;
}

export function isUserRole(value: string): value is UserRole {
  return ["student", "teacher", "admin", "super_admin"].includes(value);
}

export function getInitials(displayName: string): string {
  const initials = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "?";
}
