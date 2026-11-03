import { auth } from "@/lib/auth";
import { exec, query, queryOne } from "@/lib/db";
import { compact, normalizeEmail, validateEmail, validateName, validatePassword, type FieldErrors } from "@/lib/validation";

export type ManagedRole = "aluno" | "professor";
export const PER_PAGE = 6;

export type UserListItem = { id: string; name: string; email: string; createdAt: string; courses: string | null };
export type UserDetail = UserListItem & { role: ManagedRole; banned: number; registration: string | null };

// Texto com os cursos ligados ao usuário: matrículas (aluno) ou cursos sob responsabilidade (professor).
const COURSES_SQL: Record<ManagedRole, string> = {
  aluno: "(SELECT GROUP_CONCAT(c.name ORDER BY c.name SEPARATOR ', ') FROM enrollments e JOIN courses c ON c.id = e.course_id WHERE e.user_id = u.id)",
  professor: "(SELECT GROUP_CONCAT(c.name ORDER BY c.name SEPARATOR ', ') FROM courses c WHERE c.teacher_id = u.id)"
};

const likeTerm = (q: string) => `%${q.replace(/[\\%_]/g, "\\$&")}%`;

export async function listUsers(role: ManagedRole, q = "", page = 1) {
  const term = q.trim();
  const where = term ? "AND (u.name LIKE ? OR u.email LIKE ?)" : "";
  const params: unknown[] = term ? [role, likeTerm(term), likeTerm(term)] : [role];
  const total = Number((await queryOne<{ n: number }>(`SELECT COUNT(*) AS n FROM user u WHERE u.role = ? ${where}`, params))?.n ?? 0);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pages);
  const items = await query<UserListItem>(
    `SELECT u.id, u.name, u.email, u.createdAt, ${COURSES_SQL[role]} AS courses FROM user u WHERE u.role = ? ${where}
     ORDER BY u.createdAt DESC, u.name ASC LIMIT ? OFFSET ?`,
    [...params, PER_PAGE, (current - 1) * PER_PAGE]);
  return { items, total, page: current, pages, from: total ? (current - 1) * PER_PAGE + 1 : 0, to: Math.min(current * PER_PAGE, total) };
}

export async function countUsers(role: ManagedRole): Promise<number> {
  return Number((await queryOne<{ n: number }>("SELECT COUNT(*) AS n FROM user WHERE role = ?", [role]))?.n ?? 0);
}

export async function getUser(id: string, role?: ManagedRole): Promise<UserDetail | null> {
  const row = await queryOne<UserDetail>(
    `SELECT u.id, u.name, u.email, u.role, u.banned, u.createdAt, u.registration,
      CASE u.role WHEN 'professor' THEN ${COURSES_SQL.professor} ELSE ${COURSES_SQL.aluno} END AS courses
     FROM user u WHERE u.id = ? AND u.role IN ('aluno','professor')`, [id]);
  if (!row || (role && row.role !== role)) return null;
  return row;
}

export type UserInput = { name?: unknown; email?: unknown; password?: unknown };
export class UserError extends Error {
  constructor(message: string, public status: number, public errors: FieldErrors = {}) { super(message); }
}

function validateInput(input: UserInput, mode: "create" | "update" | "register"): FieldErrors {
  return compact({
    name: validateName(input.name) ?? undefined,
    email: validateEmail(input.email) ?? undefined,
    password: validatePassword(input.password, { required: mode !== "update", strong: mode === "register" }) ?? undefined
  });
}

async function assertEmailFree(email: string, ignoreId?: string) {
  const taken = await queryOne<{ id: string }>("SELECT id FROM user WHERE email = ? AND id <> ?", [email, ignoreId ?? ""]);
  if (taken) throw new UserError("Este e-mail já está cadastrado.", 409, { email: "E-mail já cadastrado" });
}

export async function nextRegistration(): Promise<string> {
  const row = await queryOne<{ m: string | number | null }>("SELECT MAX(CAST(SUBSTRING(registration, 7) AS UNSIGNED)) AS m FROM user WHERE registration LIKE 'ED____%'");
  return `ED${new Date().getFullYear()}${String(Number(row?.m ?? 0) + 1).padStart(3, "0")}`;
}

// Cria conta no Better Auth (hash da senha incluso) e define o papel no servidor.
export async function createUser(role: ManagedRole, input: UserInput, mode: "create" | "register" = "create") {
  const errors = validateInput(input, mode);
  if (Object.keys(errors).length) throw new UserError("Revise os campos indicados antes de salvar.", 400, errors);
  const name = String(input.name).trim(); const email = normalizeEmail(String(input.email));
  await assertEmailFree(email);
  const result = await auth.api.signUpEmail({ body: { name, email, password: String(input.password) } });
  // Aluno recebe número de matrícula (ED + ano + sequência). A chave única evita repetição em cadastros simultâneos.
  let registration: string | null = null;
  if (role === "aluno") {
    for (let attempt = 0; attempt < 5 && !registration; attempt++) {
      const candidate = await nextRegistration();
      try { await exec("UPDATE user SET role = ?, registration = ? WHERE id = ?", [role, candidate, result.user.id]); registration = candidate; }
      catch (e) { if ((e as { code?: string }).code !== "ER_DUP_ENTRY") throw e; }
    }
  } else await exec("UPDATE user SET role = ? WHERE id = ?", [role, result.user.id]);
  await exec("DELETE FROM session WHERE userId = ?", [result.user.id]); // a conta nasce sem sessão aberta
  return { id: result.user.id, name, email };
}

export async function updateUser(id: string, role: ManagedRole, input: UserInput) {
  const current = await getUser(id, role);
  if (!current) throw new UserError("Cadastro não encontrado.", 404);
  const errors = validateInput(input, "update");
  if (Object.keys(errors).length) throw new UserError("Revise os campos indicados antes de salvar.", 400, errors);
  const name = String(input.name).trim(); const email = normalizeEmail(String(input.email));
  await assertEmailFree(email, id);
  await exec("UPDATE user SET name = ?, email = ? WHERE id = ?", [name, email, id]);
  if (typeof input.password === "string" && input.password) await setPassword(id, input.password);
  return { id, name, email };
}

// Troca a senha usando o mesmo algoritmo do Better Auth e encerra as sessões abertas.
export async function setPassword(userId: string, password: string) {
  const ctx = await auth.$context;
  const hash = await ctx.password.hash(password);
  const result = await exec("UPDATE account SET password = ? WHERE userId = ? AND providerId = 'credential'", [hash, userId]);
  if (!result.affectedRows) throw new UserError("Conta de acesso não encontrada.", 404);
  await exec("DELETE FROM session WHERE userId = ?", [userId]);
}

export async function deleteUser(id: string, role: ManagedRole) {
  const result = await exec("DELETE FROM user WHERE id = ? AND role = ?", [id, role]);
  if (!result.affectedRows) throw new UserError("Cadastro não encontrado.", 404);
}

export function userErrorResponse(error: unknown) {
  if (error instanceof UserError) return Response.json({ message: error.message, errors: error.errors }, { status: error.status });
  console.error(error);
  return Response.json({ message: "Não foi possível concluir a operação. Tente novamente." }, { status: 500 });
}
