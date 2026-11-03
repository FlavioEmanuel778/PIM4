import Link from "next/link";
import { ArrowLeft, PenLine } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CourseSelect } from "@/components/CourseSelect";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";
import { requirePageUser } from "@/lib/auth-guard";
import { initials } from "@/lib/format";
import { listClass, pickCourse } from "@/lib/professor";

export const metadata = { title: "Turma • EduDigital" };
export const dynamic = "force-dynamic";

export default async function ClassPage({ searchParams }: { searchParams: Promise<{ curso?: string; q?: string; page?: string }> }) {
  const user = await requirePageUser("professor");
  const sp = await searchParams; const { courses, course } = await pickCourse(user.id, sp.curso);
  const q = (sp.q ?? "").slice(0, 100);
  const data = course ? await listClass(course.id, q, Number(sp.page ?? 1)) : null;
  return (
    <AppShell area="professor" nav="/professor/turma" crumbs={["Professor", "Disciplinas › Turma"]} user={user}>
      <div className="page">
        <Link className="back-link" href="/professor"><ArrowLeft aria-hidden />Voltar para Minhas Disciplinas</Link>
        <div className="page-head"><div><h1>Turma</h1><p>Consulte os alunos da disciplina e acompanhe suas matrículas.</p></div></div>
        {!course || !data ? <div className="callout info"><div><strong>Nenhuma disciplina vinculada</strong><p>Quando a administração vincular uma disciplina a você, a turma aparecerá aqui.</p></div></div> : (<>
          <p className="label">Disciplina</p>
          <div className="select-row"><CourseSelect basePath="/professor/turma" courses={courses} value={course.id} /><span className="caption">{course.students} {course.students === 1 ? "aluno" : "alunos"} • {course.teacherName}</span></div>
          <div className="card table-card">
            <div className="toolbar" style={{ alignItems: "center" }}>
              <SearchBox initial={q} keep={{ curso: String(course.id) }} withLabel={false} />
              <Link className="btn btn-primary" href={`/professor/notas?curso=${course.id}`}><PenLine aria-hidden />Lançar nota</Link>
            </div>
            <div className="grades-head" style={{ borderBottom: 0, paddingBottom: 6 }}><h2>Alunos de {course.name}</h2><span className="pill pill-blue">{data.total} {data.total === 1 ? "aluno" : "alunos"}</span></div>
            <div className="table-scroll"><table className="table">
              <thead><tr><th>Aluno</th><th>Matrícula</th><th>Situação</th></tr></thead>
              <tbody>{data.items.map((s) => (
                <tr key={s.id}>
                  <td><div className="cell-user"><span className="avatar">{initials(s.name)}</span><div><strong>{s.name}</strong><small>{s.email}</small></div></div></td>
                  <td>{s.registration ?? "—"}</td><td><span className="pill pill-green">Matriculado</span></td>
                </tr>))}
              </tbody>
            </table>{data.items.length === 0 && <div className="empty"><strong>Nenhum aluno encontrado</strong>{q ? "Tente outro nome ou e-mail." : "Quando alguém se matricular, aparecerá aqui."}</div>}</div>
            <div className="table-foot"><span>{data.total ? `Mostrando ${data.from}–${data.to} de ${data.total} ${data.total === 1 ? "aluno" : "alunos"}` : "Nenhum aluno"}</span>
              {data.pages > 1 ? <Pagination basePath="/professor/turma" q={q} page={data.page} pages={data.pages} params={{ curso: String(course.id) }} /> : <span>Página 1 de 1</span>}</div>
          </div>
        </>)}
      </div>
    </AppShell>
  );
}
