export type AppRole = "admin" | "operador" | "viewer";

export const APP_ROLES: AppRole[] = ["admin", "operador", "viewer"];

export const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Administrador",
  operador: "Operador",
  viewer: "Solo lectura",
};

export const ROLE_DESCRIPTION: Record<AppRole, string> = {
  admin: "Acceso total: configuración, roles, catálogos y datos.",
  operador: "Gestiona leads, máquinas y ventas. No edita configuración ni roles.",
  viewer: "Solo lectura del CRM, máquinas y finanzas.",
};

export type Action =
  | "manage_leads"
  | "manage_machines"
  | "manage_settings"
  | "manage_roles"
  | "manage_catalogs"
  | "view_finance";

const MATRIX: Record<Action, AppRole[]> = {
  manage_leads: ["admin", "operador"],
  manage_machines: ["admin", "operador"],
  manage_settings: ["admin"],
  manage_roles: ["admin"],
  manage_catalogs: ["admin"],
  view_finance: ["admin", "operador", "viewer"],
};

export function can(roles: AppRole[], action: Action): boolean {
  return roles.some((r) => MATRIX[action].includes(r));
}

export function highestRole(roles: AppRole[]): AppRole {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("operador")) return "operador";
  return "viewer";
}
