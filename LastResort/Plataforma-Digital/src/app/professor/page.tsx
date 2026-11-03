import Link from "next/link";
import { BookOpen, FolderOpen, Info, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CourseIcon } from "@/components/CourseIcon";
import { requirePageUser } from "@/lib/auth-guard";
import { courseHours } from "@/lib/courses";
import { firstName } from "@/lib/format";
import { listTeacherCourses } from "@/lib/professor";

export const metadata = { title: "Minhas Disciplinas • EduDigital" };
export const dynamic = "force-dynamic";

export default async function TeacherHome() {
  const user = await requirePageUser("professor");
  const courses = await listTeacherCourses(user.id);
  const students = courses.reduce((n, c) => n + c.students, 0); const published = courses.reduce((n, c) => n + c.published, 0);
  const collaborating = courses.filter((c) => c.access === "colaborador");
  return (
    <AppShell area="professor" nav="/professor" crumbs={["Professor", "Minhas Disciplinas"]} user={user}>
      <div className="page">
        <div className="page-head"><div><h1>Minhas Disciplinas</h1><p>Olá, {firstName(user.name)}! Acompanhe suas turmas e organize os materiais de aprendizagem.</p></div></div>
        <div className="stats-mini">
          <div className="card mini num"><strong>{courses.length}</strong><small>Disciplinas disponíveis</small></div>
          <div className="card mini num"><strong>{students}</strong><small>Alunos matriculados</small></div>
          <div className="card mini num"><strong>{published}</strong><small>Conteúdos publicados</small></div>
        </div>
        {courses.length === 0 && <div className="callout info"><BookOpen aria-hidden /><div><strong>Você ainda não tem disciplina vinculada</strong><p>A administração da EduDigital fará o vínculo. Em caso de dúvida, fale com o suporte.</p></div></div>}
        <div className="course-grid">
          {courses.map((c) => (
            <article className="card course-card" key={c.id}>
              <div className="top"><CourseIcon icon={c.icon} /><span className="pill pill-green">{c.active ? "Ativa" : "Inativa"}</span></div>
              <h3>{c.name}</h3><p className="desc" style={{ marginBottom: 16 }}>{c.summary}</p>
              <p className="course-meta">{courseHours(c)} • {c.lessons} aulas • {c.level}</p>
              <p className="course-meta" style={{ marginBottom: 4 }}>Professor responsável: {c.teacherName ?? "a definir"}</p>
              <p className="access">Seu acesso: {c.access === "responsavel" ? "Responsável" : "Colaborador(a)"}</p>
              <p className="counts"><span><Users aria-hidden />{c.students} {c.students === 1 ? "aluno" : "alunos"}</span><span>{c.published} {c.published === 1 ? "conteúdo publicado" : "conteúdos publicados"}</span></p>
              <div className="card-actions">
                <Link className="btn btn-primary" href={`/professor/turma?curso=${c.id}`}><Users aria-hidden />Ver turma</Link>
                <Link className="btn btn-outline" href={`/professor/conteudos?curso=${c.id}`}><FolderOpen aria-hidden />Conteúdos</Link>
              </div>
            </article>
          ))}
        </div>
        {courses.length > 0 && <div className="callout info"><Info aria-hidden /><div><strong>Tudo para acompanhar sua turma</strong><p>Em Ver turma, consulte os alunos e lance as notas. Em Conteúdos, adicione e atualize os materiais da disciplina.</p></div></div>}
        {collaborating.map((c) => <p className="note" key={c.id}>Em {c.name}, você colabora com o professor {c.teacherName}.</p>)}
      </div>
    </AppShell>
  );
}
