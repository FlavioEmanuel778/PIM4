import "dotenv/config";
import { auth } from "../src/lib/auth";
import { db, exec, queryOne } from "../src/lib/db";
import { storeBuffer } from "../src/lib/uploads";
import { COURSES } from "./seed-data";
import { makePdf } from "./pdf";

// Dados de demonstração do EduDigital. Pode ser executado mais de uma vez.
const PASSWORD = process.env.SEED_PASSWORD ?? "EduDigital2026";

const PEOPLE: { name: string; email: string; role: "admin" | "professor" | "aluno"; createdAt: string; registration?: string }[] = [
  { name: "Marina Costa", email: "admin@edudigital.com.br", role: "admin", createdAt: "2026-10-01 09:00:00" },
  { name: "Ana Paula Ribeiro", email: "ana.ribeiro@edudigital.com.br", role: "professor", createdAt: "2026-10-30 08:00:00" },
  { name: "Carlos Eduardo Santos", email: "carlos.santos@edudigital.com.br", role: "professor", createdAt: "2026-10-30 08:30:00" },
  { name: "Beatriz Oliveira", email: "beatriz.oliveira@email.com", role: "aluno", createdAt: "2026-10-30 15:20:00", registration: "ED2026001" },
  { name: "Bruno Almeida", email: "bruno.almeida@email.com", role: "aluno", createdAt: "2026-10-30 09:40:00", registration: "ED2026002" },
  { name: "Camila Souza", email: "camila.souza@email.com", role: "aluno", createdAt: "2026-10-29 17:05:00", registration: "ED2026003" },
  { name: "Diego Ferreira", email: "diego.ferreira@email.com", role: "aluno", createdAt: "2026-10-29 10:15:00", registration: "ED2026004" },
  { name: "Fernanda Lima", email: "fernanda.lima@email.com", role: "aluno", createdAt: "2026-10-28 16:00:00", registration: "ED2026005" },
  { name: "Gabriel Pereira", email: "gabriel.pereira@email.com", role: "aluno", createdAt: "2026-10-28 11:30:00", registration: "ED2026007" },
  { name: "Gabriel Costa", email: "gabriel.costa@email.com", role: "aluno", createdAt: "2026-10-27 14:00:00", registration: "ED2026006" },
  { name: "João Pedro Santos", email: "joao.santos@email.com", role: "aluno", createdAt: "2026-10-26 10:00:00", registration: "ED2026008" },
  { name: "Natália Barros", email: "natalia.barros@email.com", role: "aluno", createdAt: "2026-10-25 13:30:00", registration: "ED2026009" },
  { name: "Luiza Martins", email: "luiza.martins@email.com", role: "aluno", createdAt: "2026-10-24 09:15:00", registration: "ED2026010" },
  { name: "Otávio Ramos", email: "otavio.ramos@email.com", role: "aluno", createdAt: "2026-10-23 16:45:00", registration: "ED2026011" },
  { name: "Rafael Nascimento", email: "rafael.nascimento@email.com", role: "aluno", createdAt: "2026-10-22 11:00:00", registration: "ED2026012" }
];

async function userId(email: string): Promise<string> {
  const row = await queryOne<{ id: string }>("SELECT id FROM user WHERE email = ?", [email]);
  if (!row) throw new Error(`Usuário não encontrado: ${email}`);
  return row.id;
}

async function main() {
  for (const p of PEOPLE) {
    if (await queryOne("SELECT id FROM user WHERE email = ?", [p.email])) continue;
    const created = await auth.api.signUpEmail({ body: { name: p.name, email: p.email, password: PASSWORD } });
    await exec("UPDATE user SET role = ?, createdAt = ?, updatedAt = ?, registration = ? WHERE id = ?", [p.role, p.createdAt, p.createdAt, p.registration ?? null, created.user.id]);
    await exec("DELETE FROM session WHERE userId = ?", [created.user.id]);
  }

  const hasCourses = !!(await queryOne("SELECT id FROM courses LIMIT 1"));

  // Conteúdo dos cursos: cria o que falta e atualiza os textos (não apaga progresso dos alunos).
  const courseIds: Record<string, number> = {}; const contentIds: Record<string, number[]> = {}; const exerciseIds: Record<string, number[]> = {};
  for (const c of COURSES) {
    const found = await queryOne<{ id: number }>("SELECT id FROM courses WHERE name = ?", [c.name]);
    let courseId = found?.id;
    if (!courseId) {
      courseId = (await exec("INSERT INTO courses (name, summary, tagline, icon, level, teacher_id) VALUES (?, ?, ?, ?, ?, ?)", [c.name, c.summary, c.tagline, c.icon, c.level, await userId(c.teacherEmail)])).insertId;
    } else await exec("UPDATE courses SET summary = ?, tagline = ?, icon = ?, level = ? WHERE id = ?", [c.summary, c.tagline, c.icon, c.level, courseId]);
    courseIds[c.name] = courseId; contentIds[c.name] = []; exerciseIds[c.name] = [];

    for (const [i, ct] of c.contents.entries()) {
      const row = await queryOne<{ id: number; material_kind: string | null }>("SELECT id, material_kind FROM contents WHERE course_id = ? AND position = ?", [courseId, i + 1]);
      let id = row?.id;
      if (!id) id = (await exec("INSERT INTO contents (course_id, position, title, description, lessons, duration_minutes, body) VALUES (?, ?, ?, ?, ?, ?, ?)", [courseId, i + 1, ct.title, ct.description, ct.lessons, ct.minutes, ct.body])).insertId;
      else await exec("UPDATE contents SET title = ?, description = ?, lessons = ?, duration_minutes = ?, body = ? WHERE id = ?", [ct.title, ct.description, ct.lessons, ct.minutes, ct.body, id]);
      contentIds[c.name].push(id);
      if (!row?.material_kind) { // material de exemplo: arquivo PDF gerado ou link externo
        if (ct.material.kind === "arquivo") {
          const f = await storeBuffer(makePdf(ct.title, `${ct.description}\n\n${ct.body}`), ct.material.name);
          await exec("UPDATE contents SET material_kind = 'arquivo', material_name = ?, material_size = ?, material_mime = ?, material_file = ? WHERE id = ?", [ct.material.name, f.size, f.mime, f.file, id]);
        } else await exec("UPDATE contents SET material_kind = 'link', material_url = ? WHERE id = ?", [ct.material.url, id]);
      }
    }
    for (const [i, ex] of c.exercises.entries()) {
      const row = await queryOne<{ id: number }>("SELECT id FROM exercises WHERE course_id = ? AND position = ?", [courseId, i + 1]);
      const v = [ex.title, ex.description, ex.category, ex.prompt, ex.scenario, ...ex.options, ex.correct, ex.feedbackCorrect, ex.feedbackWrong];
      if (row) { await exec("UPDATE exercises SET title=?, description=?, category=?, prompt=?, scenario=?, option_a=?, option_b=?, option_c=?, option_d=?, correct=?, feedback_correct=?, feedback_wrong=? WHERE id=?", [...v, row.id]); exerciseIds[c.name].push(row.id); }
      else exerciseIds[c.name].push((await exec("INSERT INTO exercises (course_id, position, title, description, category, prompt, scenario, option_a, option_b, option_c, option_d, correct, feedback_correct, feedback_wrong) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [courseId, i + 1, ...v])).insertId);
    }
    for (const [i, q] of c.quiz.entries()) {
      const row = await queryOne<{ id: number }>("SELECT id FROM quiz_questions WHERE course_id = ? AND position = ?", [courseId, i + 1]);
      const v = [q.category, q.topic, q.prompt, ...q.options, q.correct, q.explanation];
      if (row) await exec("UPDATE quiz_questions SET category=?, topic=?, prompt=?, option_a=?, option_b=?, option_c=?, option_d=?, correct=?, explanation=? WHERE id=?", [...v, row.id]);
      else await exec("INSERT INTO quiz_questions (course_id, position, category, topic, prompt, option_a, option_b, option_c, option_d, correct, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [courseId, i + 1, ...v]);
    }
  }

  // Matrículas: 7 alunos em Proteção de Dados e 5 em Inclusão Digital (Beatriz está nos dois).
  const protecao = ["beatriz.oliveira", "camila.souza", "fernanda.lima", "gabriel.costa", "joao.santos", "luiza.martins", "rafael.nascimento"];
  const inclusao = ["beatriz.oliveira", "bruno.almeida", "diego.ferreira", "gabriel.pereira", "natalia.barros"];
  for (const e of protecao) await exec("INSERT IGNORE INTO enrollments (user_id, course_id, created_at) VALUES (?, ?, '2026-10-30 15:30:00')", [await userId(`${e}@email.com`), courseIds["Proteção de Dados"]]);
  for (const e of inclusao) await exec("INSERT IGNORE INTO enrollments (user_id, course_id, created_at) VALUES (?, ?, '2026-10-30 15:40:00')", [await userId(`${e}@email.com`), courseIds["Inclusão Digital"]]);

  // Ana é responsável por Proteção de Dados e colaboradora em Inclusão Digital.
  await exec("INSERT IGNORE INTO course_collaborators (course_id, user_id) VALUES (?, ?)", [courseIds["Inclusão Digital"], await userId("ana.ribeiro@edudigital.com.br")]);

  // Notas já lançadas pela professora em Proteção de Dados (a da Beatriz nasce quando ela fizer o questionário).
  const grades: [string, number][] = [["camila.souza", 9], ["fernanda.lima", 7.5], ["gabriel.costa", 8.5], ["joao.santos", 6], ["luiza.martins", 10], ["rafael.nascimento", 7]];
  const ana = await userId("ana.ribeiro@edudigital.com.br");
  for (const [e, score] of grades) await exec("INSERT IGNORE INTO grades (user_id, course_id, score, updated_by) VALUES (?, ?, ?, ?)", [await userId(`${e}@email.com`), courseIds["Proteção de Dados"], score, ana]);

  if (!hasCourses) {
    // Progresso da Beatriz, igual ao Design PIM: 4 de 6 etapas em Proteção de Dados e 2 de 6 em Inclusão Digital.
    const bea = await userId("beatriz.oliveira@email.com");
    for (const id of contentIds["Proteção de Dados"]) await exec("INSERT INTO content_progress (user_id, content_id) VALUES (?, ?)", [bea, id]);
    await exec("INSERT INTO exercise_attempts (user_id, exercise_id, choice, is_correct) VALUES (?, ?, 'B', 1)", [bea, exerciseIds["Proteção de Dados"][0]]);
    await exec("INSERT INTO content_progress (user_id, content_id) VALUES (?, ?)", [bea, contentIds["Inclusão Digital"][0]]);
    await exec("INSERT INTO exercise_attempts (user_id, exercise_id, choice, is_correct) VALUES (?, ?, 'A', 1)", [bea, exerciseIds["Inclusão Digital"][0]]);
    const cam = await userId("camila.souza@email.com");
    for (const id of contentIds["Proteção de Dados"].slice(0, 2)) await exec("INSERT INTO content_progress (user_id, content_id) VALUES (?, ?)", [cam, id]);
  }

  console.log("Dados de exemplo prontos.");
  console.log(`Senha de todas as contas de demonstração: ${PASSWORD}`);
  console.log("  Administradora: admin@edudigital.com.br");
  console.log("  Professora:     ana.ribeiro@edudigital.com.br");
  console.log("  Aluna:          beatriz.oliveira@email.com");
  await db.end();
}
main().catch((error) => { console.error(error); process.exit(1); });
