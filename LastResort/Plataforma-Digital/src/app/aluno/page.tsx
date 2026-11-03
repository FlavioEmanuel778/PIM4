import Link from "next/link";
import { ArrowRight, BookOpen, CircleCheck, Info } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CourseIcon } from "@/components/CourseIcon";
import { EnrollButton } from "@/components/StudentActions";
import { requirePageUser } from "@/lib/auth-guard";
import { courseHours, listAvailableCourses, listStudentCourses } from "@/lib/courses";
import { firstName } from "@/lib/format";

export const metadata = { title: "Meus Cursos • EduDigital" };
export const dynamic = "force-dynamic";

export default async function StudentHome() {
  const user = await requirePageUser("aluno");
  const [mine, available] = await Promise.all([listStudentCourses(user.id), listAvailableCourses(user.id)]);
  const done = mine.reduce((n, c) => n + c.progress.done, 0); const evaluations = mine.filter((c) => c.quizDone).length;
  return (
    <AppShell area="aluno" nav="/aluno" crumbs={["Aluno", "Meus Cursos"]} user={user}>
      <div className="page">
        <div className="page-head"><div><h1>Meus Cursos</h1><p>Olá, {firstName(user.name)}! Continue aprendendo e ganhe mais autonomia no mundo digital.</p></div></div>
        <div className="stats-mini">
          <div className="card mini num"><strong>{mine.length}</strong><small>Cursos em andamento</small></div>
          <div className="card mini num"><strong>{done}</strong><small>Atividades concluídas</small></div>
          <div className="card mini num"><strong>{evaluations}</strong><small>Avaliações realizadas</small></div>
        </div>
        {mine.length === 0 && <div className="callout info"><BookOpen aria-hidden /><div><strong>Você ainda não está em nenhum curso</strong><p>Escolha um curso abaixo para começar a aprender.</p></div></div>}
        <div className="course-grid">
          {mine.map((c) => {
            const status = c.progress.done === 0 ? "Não iniciado" : c.progress.done >= c.progress.total ? "Concluído" : "Em andamento";
            return (
              <article className="card course-card" key={c.id}>
                <div className="top"><CourseIcon icon={c.icon} /><span className="pill pill-blue">{status}</span></div>
                <h3>{c.name}</h3><p className="desc" style={{ marginBottom: 16 }}>{c.summary}</p>
                <p className="course-meta">{courseHours(c)} • {c.lessons} aulas • {c.level}</p>
                <p className="course-meta" style={{ marginBottom: 14 }}>{c.teacherName ?? "Professor a definir"}</p>
                <div className="progress-line"><span>{c.progress.done} de {c.progress.total} atividades concluídas</span><strong>{c.progress.percent}%</strong></div>
                <div className="bar" role="img" aria-label={`${c.progress.percent}% concluído`}><i style={{ width: `${c.progress.percent}%` }} /></div>
                <p className="progress-sub">Próximo passo: {c.nextStep}</p>
                <div className="card-actions end"><Link className="btn btn-primary" href={`/aluno/cursos/${c.id}`}><ArrowRight aria-hidden />Acessar</Link></div>
              </article>
            );
          })}
        </div>
        {available.length > 0 && (<>
          <h2 className="section-title">Outros cursos para você</h2><p className="section-sub">Matricule-se para estudar no seu ritmo.</p>
          <div className="card list-card">{available.map((c) => (
            <div className="item-row" key={c.id}><span className="state"><CourseIcon icon={c.icon} /></span><div className="txt"><h3>{c.name}</h3><p>{c.summary}</p><p className="meta">{courseHours(c)} • {c.lessons} aulas • {c.teacherName ?? "Professor a definir"}</p></div><EnrollButton courseId={c.id} /></div>
          ))}</div>
        </>)}
        <div className="callout info" style={{ marginTop: 24 }}><Info aria-hidden /><div><strong>Um passo de cada vez</strong><p>Estude os conteúdos, pratique sem valer nota e, quando se sentir pronta, faça o questionário avaliativo.</p></div></div>
        <p className="note"><CircleCheck size={14} style={{ verticalAlign: "-2px", marginRight: 6, color: "var(--green)" }} aria-hidden />Seu progresso considera os conteúdos, os exercícios e a avaliação de cada curso.</p>
      </div>
    </AppShell>
  );
}
