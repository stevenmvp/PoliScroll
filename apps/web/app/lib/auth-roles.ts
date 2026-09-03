export type AuthRole = "admin" | "profesor" | "estudiante";

export const roleLabels: Record<AuthRole, string> = {
  admin: "Administrador",
  profesor: "Profesor",
  estudiante: "Estudiante",
};

export const roleRoutes: Record<AuthRole, string> = {
  admin: "/admin",
  profesor: "/profesor",
  estudiante: "/estudiante",
};

export const rolePermissions: Record<AuthRole, string[]> = {
  admin: ["users", "content", "metrics", "settings"],
  profesor: ["classes", "content", "students", "analytics"],
  estudiante: ["lessons", "progress", "profile", "feedback"],
};
