export type UserRole = "passenger" | "controller" | "admin";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  cedula?: string;
  phone?: string;
  cooperative?: string;
  token?: string;
  isSenior?: boolean;
}
