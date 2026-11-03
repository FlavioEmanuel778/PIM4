import { exec, query, queryOne } from "@/lib/db";
import { getEffectiveGrade, toMaterial, type Course, type Material } from "@/lib/courses";
import { removeStored, storeUpload, UploadError } from "@/lib/uploads";

// ---------- Acesso: responsável (courses.teacher_id) ou colaborador (course_collaborators) ----------
export type TeacherCourse = Course & { access: "responsavel" | "colaborador"; published: number };
type Row = Omit<TeacherCourse, "minutes" | "lessons" | "students" | "published"> & { minutes: string | number; lessons: string | number; students: string | number; published: string | number };

export async function listTeacherCourses(userId: string): Promise<TeacherCourse[]> {
  const rows = await query<Row>(
    `SELECT c.id, c.name, c.summary, c.tagline, c.icon, c.level, c.active, c.teacher_id AS teacherId, t.name AS teacherName,
      IF(c.teacher_id = ?, 'responsavel', 'colaborador') AS access,
      COALESCE((SELECT SUM(duration_minutes) FROM contents WHERE course_id = c.id AND published = 1), 0) AS minutes,
      COALESCE((SELECT SUM(lessons) FROM contents WHERE course_id = c.id AND published = 1), 0) AS lessons,
      (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) AS students,
      (SELECT COUNT(*) FROM contents WHERE course_id = c.id AND published = 1) AS published
     FROM courses c LEFT JOIN user t ON t.id = c.teacher_id
     WHERE c.teacher_id = ? OR c.id IN (SELECT course_id FROM course_collaborators WHERE user_id = ?) ORDER BY c.id`, [userId, userId, userId]);
  return rows.map((r) => ({ ...r, minutes: Number(r.minutes), lessons: Number(r.lessons), students: Number(r.students), published: Number(r.published) }));
}

// Escolhe a disciplina pedida em ?curso=; se não houver (ou não for do professor), usa a primeira.
export async function pickCourse(userId: string, param?: string) {
  const courses = await listTeacherCourses(userId);
  const wanted = Number(param);
  const course = courses.find((c) => c.id === wanted) ?? courses[0] ?? null;
  return { courses, course };
}
export async function canManageCourse(userId: string, courseId: number): Promise<boolean> {
  return !!(await queryOne("SELECT 1 AS ok FROM courses c WHERE c.id = ? AND (c.teacher_id = ? OR EXISTS (SELECT 1 FROM course_collaborators cc WHERE cc.course_id = c.id AND cc.user_id = ?))", [courseId, userId, userId]));
}

// ---------- Turma ----------
export const CLASS_PER_PAGE = 10;
export type ClassStudent = { id: string; name: string; email: string; registration: string | null };
const likeTerm = (q: string) => `%${q.replace(/[\\%_]/g, "\\$&")}%`;
export async function listClass(courseId: number, q = "", page = 1) {
  const term = q.trim(); const where = term ? "AND (u.name LIKE ? OR u.email LIKE ? OR u.registration LIKE ?)" : "";
  const params: unknown[] = term ? [courseId, likeTerm(term), likeTerm(term), likeTerm(term)] : [courseId];
  const total = Number((await queryOne<{ n: number }>(`SELECT COUNT(*) AS n FROM enrollments e JOIN user u ON u.id = e.user_id WHERE e.course_id = ? ${where}`, params))?.n ?? 0);
  const pages = Math.max(1, Math.ceil(total / CLASS_PER_PAGE)); const current = Math.min(Math.max(1, Math.floor(page) || 1), pages);
  const items = await query<ClassStudent>(`SELECT u.id, u.name, u.email, u.registration FROM enrollments e JOIN user u ON u.id = e.user_id WHERE e.course_id = ? ${where} ORDER BY u.name LIMIT ? OFFSET ?`, [...params, CLASS_PER_PAGE, (current - 1) * CLASS_PER_PAGE]);
  return { items, total, page: current, pages, from: total ? (current - 1) * CLASS_PER_PAGE + 1 : 0, to: Math.min(current * CLASS_PER_PAGE, total) };
}

// ---------- Conteúdos ----------
export type ManagedContent = { id: number; position: number; title: string; description: string; published: boolean; material: Material };
type ContentRow = { id: number; position: number; title: string; description: string; published: number; material_kind: string | null; material_name: string | null; material_size: number | null; material_url: string | null };
const toManaged = (r: ContentRow): ManagedContent => ({ id: r.id, position: r.position, title: r.title, description: r.description, published: !!r.published, material: toMaterial(r) });
const CONTENT_COLS = "id, position, title, description, published, material_kind, material_name, material_size, material_url";

export async function listManagedContents(courseId: number): Promise<ManagedContent[]> {
  return (await query<ContentRow>(`SELECT ${CONTENT_COLS} FROM contents WHERE course_id = ? ORDER BY position, id`, [courseId])).map(toManaged);
}
export async function getManagedContent(id: number) {
  const r = await queryOne<ContentRow & { course_id: number }>(`SELECT ${CONTENT_COLS}, course_id FROM contents WHERE id = ?`, [id]);
  return r ? { ...toManaged(r), courseId: r.course_id } : null;
}

export class ContentError extends Error { constructor(message: string, public status = 400, public errors: Record<string, string> = {}) { super(message); } }
export type ContentInput = { title: unknown; description: unknown; published: unknown; kind: unknown; url: unknown; file: File | null };

function parseInput(input: ContentInput) {
  const errors: Record<string, string> = {};
  const title = typeof input.title === "string" ? input.title.trim() : ""; const description = typeof input.description === "string" ? input.description.trim() : "";
  if (!title) errors.title = "Título obrigatório"; else if (title.length > 160) errors.title = "Use no máximo 160 caracteres";
  if (!description) errors.description = "Descrição obrigatória"; else if (description.length > 1000) errors.description = "Use no máximo 1000 caracteres";
  const kind = input.kind === "arquivo" || input.kind === "link" ? input.kind : null;
  let url: string | null = null;
  if (kind === "link") {
    const raw = typeof input.url === "string" ? input.url.trim() : "";
    try { const u = new URL(raw); if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error(); if (raw.length > 500) throw new Error(); url = u.toString(); }
    catch { errors.url = raw ? "Informe um endereço válido, começando com http:// ou https://" : "Informe o endereço do material"; }
  }
  const published = input.published === true || input.published === "true" || input.published === "on" || input.published === "1";
  return { errors, title, description, kind, url, published };
}

// Cria o conteúdo; o arquivo (se houver) é validado e gravado no disco.
export async function createContent(courseId: number, input: ContentInput) {
  const p = parseInput(input);
  if (p.kind === "arquivo" && !input.file) p.errors.file = "Selecione um arquivo";
  if (Object.keys(p.errors).length) throw new ContentError("Revise os campos indicados antes de salvar.", 400, p.errors);
  let stored = null;
  if (p.kind === "arquivo" && input.file) { try { stored = await storeUpload(input.file); } catch (e) { if (e instanceof UploadError) throw new ContentError(e.message, 400, { file: e.message }); throw e; } }
  const pos = Number((await queryOne<{ m: number | null }>("SELECT MAX(position) AS m FROM contents WHERE course_id = ?", [courseId]))?.m ?? 0) + 1;
  const res = await exec(
    "INSERT INTO contents (course_id, position, title, description, lessons, duration_minutes, body, published, material_kind, material_name, material_size, material_mime, material_file, material_url) VALUES (?, ?, ?, ?, 0, 0, '', ?, ?, ?, ?, ?, ?, ?)",
    [courseId, pos, p.title, p.description, p.published ? 1 : 0, p.kind, stored?.name ?? null, stored?.size ?? null, stored?.mime ?? null, stored?.file ?? null, p.url]);
  return res.insertId;
}

export async function updateContent(id: number, input: ContentInput) {
  const current = await queryOne<{ material_kind: string | null; material_file: string | null }>("SELECT material_kind, material_file FROM contents WHERE id = ?", [id]);
  if (!current) throw new ContentError("Conteúdo não encontrado.", 404);
  const p = parseInput(input);
  if (p.kind === "arquivo" && !input.file && !current.material_file) p.errors.file = "Selecione um arquivo";
  if (Object.keys(p.errors).length) throw new ContentError("Revise os campos indicados antes de salvar.", 400, p.errors);
  if (p.kind === "arquivo") {
    if (input.file) { // substitui o anexo
      let stored; try { stored = await storeUpload(input.file); } catch (e) { if (e instanceof UploadError) throw new ContentError(e.message, 400, { file: e.message }); throw e; }
      await exec("UPDATE contents SET title=?, description=?, published=?, material_kind='arquivo', material_name=?, material_size=?, material_mime=?, material_file=?, material_url=NULL WHERE id=?",
        [p.title, p.description, p.published ? 1 : 0, stored.name, stored.size, stored.mime, stored.file, id]);
      await removeStored(current.material_file);
    } else await exec("UPDATE contents SET title=?, description=?, published=? WHERE id=?", [p.title, p.description, p.published ? 1 : 0, id]); // mantém o anexo atual
  } else {
    await exec("UPDATE contents SET title=?, description=?, published=?, material_kind=?, material_name=NULL, material_size=NULL, material_mime=NULL, material_file=NULL, material_url=? WHERE id=?",
      [p.title, p.description, p.published ? 1 : 0, p.kind, p.url, id]);
    await removeStored(current.material_file);
  }
}

export async function deleteContent(id: number) {
  const row = await queryOne<{ material_file: string | null }>("SELECT material_file FROM contents WHERE id = ?", [id]);
  if (!row) throw new ContentError("Conteúdo não encontrado.", 404);
  await exec("DELETE FROM contents WHERE id = ?", [id]);
  await removeStored(row.material_file);
}

// ---------- Notas ----------
export type SheetRow = ClassStudent & { grade: number | null };
export async function getGradeSheet(courseId: number): Promise<SheetRow[]> {
  const students = await query<ClassStudent>("SELECT u.id, u.name, u.email, u.registration FROM enrollments e JOIN user u ON u.id = e.user_id WHERE e.course_id = ? ORDER BY u.name", [courseId]);
  return Promise.all(students.map(async (s) => ({ ...s, grade: await getEffectiveGrade(s.id, courseId) })));
}

// "7,5" ou "7.5" -> 7.5. Aceita de 0 a 10, com no máximo uma casa decimal.
export function parseGrade(value: unknown): { ok: true; value: number | null } | { ok: false; error: string } {
  const raw = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : "";
  if (raw === "") return { ok: true, value: null };
  if (!/^\d{1,2}([.,]\d)?$/.test(raw)) return { ok: false, error: "Use de 0 a 10, com vírgula, como 7,5" };
  const n = Number(raw.replace(",", "."));
  return n < 0 || n > 10 ? { ok: false, error: "A nota deve ficar entre 0 e 10" } : { ok: true, value: n };
}

// Salva todas as notas da turma de uma vez (tudo ou nada). Campo vazio remove a nota lançada.
export async function saveGrades(courseId: number, teacherId: string, grades: Record<string, unknown>) {
  const enrolled = new Set((await query<{ user_id: string }>("SELECT user_id FROM enrollments WHERE course_id = ?", [courseId])).map((r) => r.user_id));
  const errors: Record<string, string> = {}; const parsed = new Map<string, number | null>();
  for (const [userId, raw] of Object.entries(grades)) {
    if (!enrolled.has(userId)) { errors[userId] = "Aluno não matriculado nesta disciplina"; continue; }
    const r = parseGrade(raw); if (!r.ok) errors[userId] = r.error; else parsed.set(userId, r.value);
  }
  if (Object.keys(errors).length) throw new ContentError("Revise as notas indicadas antes de salvar.", 400, errors);
  let saved = 0;
  for (const [userId, score] of parsed) {
    if (score === null) await exec("DELETE FROM grades WHERE user_id = ? AND course_id = ?", [userId, courseId]);
    else { await exec("INSERT INTO grades (user_id, course_id, score, updated_by) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE score = VALUES(score), updated_by = VALUES(updated_by)", [userId, courseId, score, teacherId]); saved += 1; }
  }
  return saved;
}
