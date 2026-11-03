import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type AppRole = "admin" | "professor" | "aluno";
export const HOME_BY_ROLE: Record<AppRole, string> = { admin: "/admin", professor: "/professor", aluno: "/aluno" };

// Uma única leitura de sessão por requisição, mesmo que várias partes da página peçam.
export const getCurrentSession = cache(async () => auth.api.getSession({ headers: await headers() }));

// ---------- Rotas de API: devolvem 401/403 em JSON ----------
export async function requireUser() {
  const session = await getCurrentSession();
  if (!session) return { error: Response.json({ message: "Autenticação necessária." }, { status: 401 }) } as const;
  if (session.user.banned) return { error: Response.json({ message: "Usuário bloqueado." }, { status: 403 }) } as const;
  return { session } as const;
}

export async function requireRole(role: AppRole) {
  const result = await requireUser();
  if ("error" in result) return result;
  if (result.session.user.role !== role) return { error: Response.json({ message: `Acesso permitido somente para ${role}.` }, { status: 403 }) } as const;
  return result;
}
export const requireAdmin = () => requireRole("admin");
export const requireStudent = () => requireRole("aluno");
export const requireProfessor = () => requireRole("professor");

// ---------- Páginas: redirecionam. A UI nunca é a barreira de segurança; as APIs também validam. ----------
export async function requirePageUser(role: AppRole) {
  const session = await getCurrentSession();
  if (!session || session.user.banned) redirect("/login");
  const current = session.user.role as AppRole;
  if (current !== role) redirect(HOME_BY_ROLE[current] ?? "/login");
  const { id, name, email } = session.user;
  return { id, name, email, role: current };
}
