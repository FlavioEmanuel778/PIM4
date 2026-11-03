import { Clock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { requirePageUser } from "@/lib/auth-guard";
import { courseHours, listAllCourses } from "@/lib/courses";
import { initials } from "@/lib/format";

export const metadata = { title: "Cursos • EduDigital" };
export const dynamic = "force-dynamic";

export default async function AdminCourses() {
  const user = await requirePageUser("admin");
  const courses = await listAllCourses();
  const enrollments = courses.reduce((n, c) => n + c.students, 0);
  const active = courses.filter((c) => c.active).length;
  return (
    <AppShell area="admin" nav="/admin/cursos" crumbs={["Administração", "Cursos"]} user={user}>
      <div className="page">
        <div className="page-head"><div><h1>Cursos</h1><p>Consulte os cursos, seus alunos e professores responsáveis.</p></div></div>
        <div className="stats-mini" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
          <div className="card mini"><div><strong>{courses.length}</strong><small>cursos disponíveis</small></div></div>
          <div className="card mini"><div><strong>{enrollments}</strong><small>alunos matriculados</small></div></div>
        </div>
        <div className="card table-card">
          <div className="toolbar" style={{ alignItems: "center" }}><strong style={{ color: "var(--ink)" }}>Todos os cursos</strong><span className="pill pill-blue">{active} cursos ativos</span></div>
          <div className="table-scroll"><table className="table">
            <thead><tr><th>Curso</th><th>Alunos</th><th>Professor responsável</th><th>Situação</th></tr></thead>
            <tbody>{courses.map((c) => (
              <tr key={c.id}>
                <td><strong style={{ color: "var(--ink)" }}>{c.name}</strong><small style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted)", fontSize: 12, marginTop: 2 }}><Clock size={12} aria-hidden />{courseHours(c)} • {c.lessons} aulas</small></td>
                <td>{c.students} {c.students === 1 ? "aluno" : "alunos"}</td>
                <td>{c.teacherName ? <div className="cell-user"><span className="avatar">{initials(c.teacherName)}</span>{c.teacherName}</div> : <span style={{ color: "var(--muted)" }}>Sem professor</span>}</td>
                <td><span className={`pill ${c.active ? "pill-green" : "pill-gray"}`}>{c.active ? "Ativo" : "Inativo"}</span></td>
              </tr>))}
            </tbody>
          </table></div>
          <div className="table-foot"><span>Mostrando 1–{courses.length} de {courses.length} cursos</span></div>
        </div>
        <p className="note">A quantidade de alunos corresponde às matrículas de cada curso na plataforma.</p>
      </div>
    </AppShell>
  );
}
