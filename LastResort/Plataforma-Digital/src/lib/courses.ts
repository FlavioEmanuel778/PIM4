import { db, exec, query, queryOne } from "@/lib/db";
import { formatDate, formatDuration } from "@/lib/format";

export type Choice = "A" | "B" | "C" | "D";
export const CHOICES: Choice[] = ["A", "B", "C", "D"];
export const isChoice = (v: unknown): v is Choice => typeof v === "string" && (CHOICES as string[]).includes(v);

// ---------- Cursos ----------
export type Course = {
  id: number; name: string; summary: string; tagline: string; icon: string; level: string; active: number;
  teacherId: string | null; teacherName: string | null; minutes: number; lessons: number; students: number;
};
type CourseRow = Omit<Course, "minutes" | "lessons" | "students"> & { minutes: string | number; lessons: string | number; students: string | number };

const COURSE_SQL = `SELECT c.id, c.name, c.summary, c.tagline, c.icon, c.level, c.active, c.teacher_id AS teacherId, t.name AS teacherName,
  COALESCE((SELECT SUM(duration_minutes) FROM contents WHERE course_id = c.id AND published = 1), 0) AS minutes,
  COALESCE((SELECT SUM(lessons) FROM contents WHERE course_id = c.id AND published = 1), 0) AS lessons,
  (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) AS students
  FROM courses c LEFT JOIN user t ON t.id = c.teacher_id`;
const toCourse = (r: CourseRow): Course => ({ ...r, minutes: Number(r.minutes), lessons: Number(r.lessons), students: Number(r.students) });

export async function listCourses(): Promise<Course[]> {
  return (await query<CourseRow>(`${COURSE_SQL} WHERE c.active = 1 ORDER BY c.id`)).map(toCourse);
}
export async function listAllCourses(): Promise<Course[]> {
  return (await query<CourseRow>(`${COURSE_SQL} ORDER BY c.id`)).map(toCourse);
}
export async function getCourse(id: number): Promise<Course | null> {
  const row = await queryOne<CourseRow>(`${COURSE_SQL} WHERE c.id = ?`, [id]);
  return row ? toCourse(row) : null;
}
export const courseHours = (c: Pick<Course, "minutes">) => formatDuration(c.minutes);

// ---------- Matrícula e progresso ----------
export async function isEnrolled(userId: string, courseId: number): Promise<boolean> {
  return !!(await queryOne("SELECT 1 AS ok FROM enrollments WHERE user_id = ? AND course_id = ?", [userId, courseId]));
}
export async function enroll(userId: string, courseId: number): Promise<boolean> {
  const course = await queryOne("SELECT id FROM courses WHERE id = ? AND active = 1", [courseId]);
  if (!course) return false;
  await exec("INSERT IGNORE INTO enrollments (user_id, course_id) VALUES (?, ?)", [userId, courseId]);
  return true;
}

export type Progress = { done: number; total: number; percent: number };
export async function progressFor(userId: string, courseId: number): Promise<Progress> {
  const [c, e, q] = await Promise.all([
    queryOne<{ total: number; done: string | number | null }>(
      "SELECT COUNT(*) AS total, SUM(cp.user_id IS NOT NULL) AS done FROM contents ct LEFT JOIN content_progress cp ON cp.content_id = ct.id AND cp.user_id = ? WHERE ct.course_id = ? AND ct.published = 1", [userId, courseId]),
    queryOne<{ total: number; done: string | number | null }>(
      "SELECT COUNT(*) AS total, SUM(EXISTS(SELECT 1 FROM exercise_attempts a WHERE a.exercise_id = x.id AND a.user_id = ? AND a.is_correct = 1)) AS done FROM exercises x WHERE x.course_id = ?", [userId, courseId]),
    queryOne<{ total: number; done: number }>(
      "SELECT (SELECT COUNT(*) > 0 FROM quiz_questions WHERE course_id = ?) AS total, ((SELECT COUNT(*) FROM quiz_attempts WHERE user_id = ? AND course_id = ?) > 0 OR (SELECT COUNT(*) FROM grades WHERE user_id = ? AND course_id = ?) > 0) AS done", [courseId, userId, courseId, userId, courseId])
  ]);
  const total = Number(c?.total ?? 0) + Number(e?.total ?? 0) + Number(q?.total ?? 0);
  const done = Number(c?.done ?? 0) + Number(e?.done ?? 0) + Number(q?.done ?? 0);
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

export type StudentCourse = Course & { progress: Progress; nextStep: string; quizDone: boolean };
// Primeiro item ainda não concluído, na ordem: conteúdos, exercícios, questionário.
async function nextStepFor(userId: string, courseId: number): Promise<string> {
  const content = await queryOne<{ title: string }>("SELECT ct.title FROM contents ct LEFT JOIN content_progress cp ON cp.content_id = ct.id AND cp.user_id = ? WHERE ct.course_id = ? AND ct.published = 1 AND cp.user_id IS NULL ORDER BY ct.position LIMIT 1", [userId, courseId]);
  if (content) return `estudar ${content.title}`;
  const ex = await queryOne<{ title: string }>("SELECT x.title FROM exercises x WHERE x.course_id = ? AND NOT EXISTS (SELECT 1 FROM exercise_attempts a WHERE a.exercise_id = x.id AND a.user_id = ? AND a.is_correct = 1) ORDER BY x.position LIMIT 1", [courseId, userId]);
  if (ex) return `praticar ${ex.title}`;
  const quiz = await queryOne("SELECT 1 AS ok FROM quiz_questions q WHERE q.course_id = ? AND NOT EXISTS (SELECT 1 FROM quiz_attempts a WHERE a.user_id = ? AND a.course_id = q.course_id) AND NOT EXISTS (SELECT 1 FROM grades g WHERE g.user_id = ? AND g.course_id = q.course_id) LIMIT 1", [courseId, userId, userId]);
  return quiz ? "fazer o questionário avaliativo" : "tudo concluído";
}
export async function listStudentCourses(userId: string): Promise<StudentCourse[]> {
  const rows = (await query<CourseRow>(`${COURSE_SQL} JOIN enrollments en ON en.course_id = c.id AND en.user_id = ? WHERE c.active = 1 ORDER BY en.created_at, c.id`, [userId])).map(toCourse);
  return Promise.all(rows.map(async (c) => {
    const [progress, nextStep, grade] = await Promise.all([progressFor(userId, c.id), nextStepFor(userId, c.id), getEffectiveGrade(userId, c.id)]);
    return { ...c, progress, nextStep, quizDone: grade !== null };
  }));
}
export async function listAvailableCourses(userId: string): Promise<Course[]> {
  return (await query<CourseRow>(`${COURSE_SQL} WHERE c.active = 1 AND c.id NOT IN (SELECT course_id FROM enrollments WHERE user_id = ?) ORDER BY c.id`, [userId])).map(toCourse);
}

// ---------- Detalhe do curso (visão do aluno) ----------
export type ContentItem = { id: number; position: number; title: string; description: string; lessons: number; minutes: number; done: boolean };
export type ExerciseItem = { id: number; position: number; title: string; description: string; done: boolean };
export type QuizSummary = { questions: number; attempt: { id: number; correct: number; total: number; createdAt: string } | null; grade: number | null };

export async function getCourseForStudent(userId: string, courseId: number) {
  if (!(await isEnrolled(userId, courseId))) return null;
  const course = await getCourse(courseId);
  if (!course) return null;
  const [contents, exercises, quizCount, attempt, progress] = await Promise.all([
    query<{ id: number; position: number; title: string; description: string; lessons: number; minutes: number; done: number }>(
      `SELECT ct.id, ct.position, ct.title, ct.description, ct.lessons, ct.duration_minutes AS minutes, (cp.user_id IS NOT NULL) AS done
       FROM contents ct LEFT JOIN content_progress cp ON cp.content_id = ct.id AND cp.user_id = ? WHERE ct.course_id = ? AND ct.published = 1 ORDER BY ct.position`, [userId, courseId]),
    query<{ id: number; position: number; title: string; description: string; done: number }>(
      `SELECT x.id, x.position, x.title, x.description,
        EXISTS(SELECT 1 FROM exercise_attempts a WHERE a.exercise_id = x.id AND a.user_id = ? AND a.is_correct = 1) AS done
       FROM exercises x WHERE x.course_id = ? ORDER BY x.position`, [userId, courseId]),
    queryOne<{ n: number }>("SELECT COUNT(*) AS n FROM quiz_questions WHERE course_id = ?", [courseId]),
    queryOne<{ id: number; correct: number; total: number; createdAt: string }>(
      "SELECT id, correct_count AS correct, total, created_at AS createdAt FROM quiz_attempts WHERE user_id = ? AND course_id = ?", [userId, courseId]),
    progressFor(userId, courseId)
  ]);
  return {
    course, progress,
    contents: contents.map((c): ContentItem => ({ ...c, done: !!c.done })),
    exercises: exercises.map((e): ExerciseItem => ({ ...e, done: !!e.done })),
    quiz: { questions: Number(quizCount?.n ?? 0), attempt, grade: await getEffectiveGrade(userId, courseId) } as QuizSummary
  };
}

// ---------- Conteúdo ----------
export type Material = { kind: "arquivo" | "link"; name: string | null; size: number | null; url: string | null } | null;
export function toMaterial(r: { material_kind: string | null; material_name: string | null; material_size: number | null; material_url: string | null }): Material {
  return r.material_kind === "arquivo" || r.material_kind === "link" ? { kind: r.material_kind, name: r.material_name, size: r.material_size, url: r.material_url } : null;
}
export async function getContentForStudent(userId: string, courseId: number, contentId: number) {
  if (!(await isEnrolled(userId, courseId))) return null;
  const row = await queryOne<{ id: number; title: string; description: string; body: string; lessons: number; minutes: number; position: number; material_kind: string | null; material_name: string | null; material_size: number | null; material_url: string | null }>(
    "SELECT id, title, description, body, lessons, duration_minutes AS minutes, position, material_kind, material_name, material_size, material_url FROM contents WHERE id = ? AND course_id = ? AND published = 1", [contentId, courseId]);
  if (!row) return null;
  const content = { id: row.id, title: row.title, description: row.description, body: row.body, lessons: row.lessons, minutes: row.minutes, position: row.position, material: toMaterial(row) };
  const done = !!(await queryOne("SELECT 1 AS ok FROM content_progress WHERE user_id = ? AND content_id = ?", [userId, contentId]));
  const next = await queryOne<{ id: number; title: string }>("SELECT id, title FROM contents WHERE course_id = ? AND position > ? AND published = 1 ORDER BY position LIMIT 1", [courseId, content.position]);
  return { content, done, next };
}
export async function completeContent(userId: string, contentId: number): Promise<boolean> {
  const row = await queryOne<{ course_id: number }>("SELECT course_id FROM contents WHERE id = ? AND published = 1", [contentId]);
  if (!row || !(await isEnrolled(userId, row.course_id))) return false;
  await exec("INSERT IGNORE INTO content_progress (user_id, content_id) VALUES (?, ?)", [userId, contentId]);
  return true;
}

// ---------- Exercícios de prática ----------
type ExerciseRow = { id: number; position: number; title: string; category: string; prompt: string; scenario: string; a: string; b: string; c: string; d: string };
export async function getExerciseForStudent(userId: string, courseId: number, exerciseId: number) {
  if (!(await isEnrolled(userId, courseId))) return null;
  // Nunca envia a alternativa correta nem o feedback ao navegador antes de o aluno acertar.
  const exercise = await queryOne<ExerciseRow>(
    "SELECT id, position, title, category, prompt, scenario, option_a AS a, option_b AS b, option_c AS c, option_d AS d FROM exercises WHERE id = ? AND course_id = ?", [exerciseId, courseId]);
  if (!exercise) return null;
  const total = Number((await queryOne<{ n: number }>("SELECT COUNT(*) AS n FROM exercises WHERE course_id = ?", [courseId]))?.n ?? 0);
  const course = await getCourse(courseId);
  const next = await queryOne<{ id: number }>("SELECT id FROM exercises WHERE course_id = ? AND position > ? ORDER BY position LIMIT 1", [courseId, exercise.position]);
  // Exercício já concluído: o aluno pode revisar a própria resposta correta e a explicação.
  const done = await queryOne<{ choice: Choice; fc: string }>(
    "SELECT a.choice, x.feedback_correct AS fc FROM exercise_attempts a JOIN exercises x ON x.id = a.exercise_id WHERE a.user_id = ? AND a.exercise_id = ? AND a.is_correct = 1 ORDER BY a.id DESC LIMIT 1", [userId, exerciseId]);
  const reviewed = done ? { correct: true, correctChoice: done.choice, feedback: done.fc } : null;
  return { exercise, total, course: course!, nextId: next?.id ?? null, reviewed };
}
export async function answerExercise(userId: string, exerciseId: number, choice: Choice) {
  const ex = await queryOne<{ course_id: number; correct: Choice; fc: string; fw: string }>(
    "SELECT course_id, correct, feedback_correct AS fc, feedback_wrong AS fw FROM exercises WHERE id = ?", [exerciseId]);
  if (!ex || !(await isEnrolled(userId, ex.course_id))) return null;
  const correct = ex.correct === choice;
  await exec("INSERT INTO exercise_attempts (user_id, exercise_id, choice, is_correct) VALUES (?, ?, ?, ?)", [userId, exerciseId, choice, correct ? 1 : 0]);
  return { correct, correctChoice: ex.correct, feedback: correct ? ex.fc : ex.fw, courseId: ex.course_id };
}

// ---------- Questionário avaliativo ----------
export type QuizQuestion = { id: number; position: number; category: string; prompt: string; options: Record<Choice, string> };
export async function getQuizForStudent(userId: string, courseId: number) {
  if (!(await isEnrolled(userId, courseId))) return null;
  const rows = await query<{ id: number; position: number; category: string; prompt: string; a: string; b: string; c: string; d: string }>(
    "SELECT id, position, category, prompt, option_a AS a, option_b AS b, option_c AS c, option_d AS d FROM quiz_questions WHERE course_id = ? ORDER BY position", [courseId]);
  const attempt = await queryOne<{ id: number }>("SELECT id FROM quiz_attempts WHERE user_id = ? AND course_id = ?", [userId, courseId]);
  const course = await getCourse(courseId);
  return {
    course: course!, alreadyDone: !!attempt,
    questions: rows.map((r): QuizQuestion => ({ id: r.id, position: r.position, category: r.category, prompt: r.prompt, options: { A: r.a, B: r.b, C: r.c, D: r.d } }))
  };
}

export class QuizError extends Error { constructor(message: string, public status: number) { super(message); } }

// Corrige no servidor: o cliente envia apenas as alternativas marcadas.
export async function submitQuiz(userId: string, courseId: number, answers: Record<string, unknown>) {
  if (!(await isEnrolled(userId, courseId))) throw new QuizError("Matricule-se no curso para fazer o questionário.", 403);
  const questions = await query<{ id: number; correct: Choice }>("SELECT id, correct FROM quiz_questions WHERE course_id = ? ORDER BY position", [courseId]);
  if (!questions.length) throw new QuizError("Este curso ainda não tem questionário.", 404);
  const chosen = new Map<number, Choice>();
  for (const q of questions) {
    const value = answers?.[String(q.id)];
    if (!isChoice(value)) throw new QuizError("Responda todas as questões antes de enviar.", 400);
    chosen.set(q.id, value);
  }
  const correct = questions.filter((q) => chosen.get(q.id) === q.correct).length;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [res] = await conn.query("INSERT INTO quiz_attempts (user_id, course_id, correct_count, total) VALUES (?, ?, ?, ?)", [userId, courseId, correct, questions.length]);
    const attemptId = (res as { insertId: number }).insertId;
    await conn.query("INSERT INTO quiz_answers (attempt_id, question_id, choice) VALUES ?", [questions.map((q) => [attemptId, q.id, chosen.get(q.id)])]);
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") throw new QuizError("Você já enviou este questionário.", 409);
    throw error;
  } finally { conn.release(); }
  return { correct, total: questions.length, grade: (correct / questions.length) * 10 };
}

export type ResultItem = { position: number; ok: boolean; topic: string; chosen: Choice; correct: Choice; chosenText: string; correctText: string; explanation: string };
export async function getQuizResult(userId: string, courseId: number) {
  const attempt = await queryOne<{ id: number; correct: number; total: number; createdAt: string }>(
    "SELECT id, correct_count AS correct, total, created_at AS createdAt FROM quiz_attempts WHERE user_id = ? AND course_id = ?", [userId, courseId]);
  if (!attempt) return null;
  const rows = await query<{ position: number; topic: string; chosen: Choice; correct: Choice; a: string; b: string; c: string; d: string; explanation: string }>(
    `SELECT q.position, q.topic, qa.choice AS chosen, q.correct, q.option_a AS a, q.option_b AS b, q.option_c AS c, q.option_d AS d, q.explanation
     FROM quiz_answers qa JOIN quiz_questions q ON q.id = qa.question_id WHERE qa.attempt_id = ? ORDER BY q.position`, [attempt.id]);
  const items = rows.map((r): ResultItem => {
    const text = { A: r.a, B: r.b, C: r.c, D: r.d };
    return { position: r.position, ok: r.chosen === r.correct, topic: r.topic, chosen: r.chosen, correct: r.correct, chosenText: text[r.chosen], correctText: text[r.correct], explanation: r.explanation };
  });
  const course = await getCourse(courseId);
  return { attempt, items, course: course!, grade: (attempt.correct / attempt.total) * 10 };
}

// ---------- Notas ----------
// A nota lançada pelo professor tem prioridade; sem ela vale a correção automática do questionário.
export async function getEffectiveGrade(userId: string, courseId: number): Promise<number | null> {
  const manual = await queryOne<{ score: string | number }>("SELECT score FROM grades WHERE user_id = ? AND course_id = ?", [userId, courseId]);
  if (manual) return Number(manual.score);
  const attempt = await queryOne<{ correct: number; total: number }>("SELECT correct_count AS correct, total FROM quiz_attempts WHERE user_id = ? AND course_id = ?", [userId, courseId]);
  return attempt ? (attempt.correct / attempt.total) * 10 : null;
}

export type GradeRow = { course: string; courseId: number; activity: string; detail: string; kind: "quiz" | "exercise"; status: "done" | "pending" | "in_progress"; grade: number | null };
export async function getGrades(userId: string) {
  const courses = await listStudentCourses(userId);
  const rows: GradeRow[] = []; const quizzes: { course: string; grade: number | null; done: boolean }[] = [];
  let lastUpdate: string | null = null;
  for (const c of courses) {
    const questions = Number((await queryOne<{ n: number }>("SELECT COUNT(*) AS n FROM quiz_questions WHERE course_id = ?", [c.id]))?.n ?? 0);
    if (questions) {
      const grade = await getEffectiveGrade(userId, c.id);
      const attempt = await queryOne<{ correct: number; total: number; createdAt: string }>("SELECT correct_count AS correct, total, created_at AS createdAt FROM quiz_attempts WHERE user_id = ? AND course_id = ?", [userId, c.id]);
      if (attempt && (!lastUpdate || attempt.createdAt > lastUpdate)) lastUpdate = attempt.createdAt;
      rows.push({ course: c.name, courseId: c.id, activity: "Questionário avaliativo", kind: "quiz", status: grade !== null ? "done" : "pending", grade,
        detail: attempt ? `${formatDate(attempt.createdAt)} • ${attempt.correct} ${attempt.correct === 1 ? "acerto" : "acertos"} e ${attempt.total - attempt.correct} ${attempt.total - attempt.correct === 1 ? "erro" : "erros"}` : grade !== null ? "Nota lançada pelo professor" : "Aguardando realização" });
      quizzes.push({ course: c.name, grade, done: grade !== null });
    }
    const ex = await queryOne<{ total: number; done: string | number | null }>(
      "SELECT COUNT(*) AS total, SUM(EXISTS(SELECT 1 FROM exercise_attempts a WHERE a.exercise_id = x.id AND a.user_id = ? AND a.is_correct = 1)) AS done FROM exercises x WHERE x.course_id = ?", [userId, c.id]);
    const total = Number(ex?.total ?? 0); const done = Number(ex?.done ?? 0);
    if (total) rows.push({ course: c.name, courseId: c.id, activity: "Exercícios de prática", detail: `${done} de ${total} concluídos`, kind: "exercise", status: done >= total ? "done" : "in_progress", grade: null });
  }
  // Questionários primeiro, depois as práticas (ordem do design).
  rows.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "quiz" ? -1 : 1));
  return { courses: courses.length, rows, quizzes, lastUpdate };
}

// ---------- Visão do admin ----------
export async function getAdminOverview() {
  const [students, teachers, courses, enrollments, recent] = await Promise.all([
    queryOne<{ n: number }>("SELECT COUNT(*) AS n FROM user WHERE role = 'aluno'"),
    queryOne<{ n: number }>("SELECT COUNT(*) AS n FROM user WHERE role = 'professor'"),
    listAllCourses(),
    queryOne<{ n: number }>("SELECT COUNT(*) AS n FROM enrollments"),
    query<{ id: string; name: string; createdAt: string; course: string | null }>(
      `SELECT u.id, u.name, u.createdAt,
        (SELECT c.name FROM enrollments e JOIN courses c ON c.id = e.course_id WHERE e.user_id = u.id ORDER BY e.created_at, c.id LIMIT 1) AS course
       FROM user u WHERE u.role = 'aluno' ORDER BY u.createdAt DESC, u.name LIMIT 4`)
  ]);
  const teachersWithCourse = Number((await queryOne<{ n: number }>("SELECT COUNT(DISTINCT teacher_id) AS n FROM courses WHERE active = 1 AND teacher_id IS NOT NULL"))?.n ?? 0);
  return { students: Number(students?.n ?? 0), teachers: Number(teachers?.n ?? 0), enrollments: Number(enrollments?.n ?? 0), teachersWithCourse, courses, recent };
}
