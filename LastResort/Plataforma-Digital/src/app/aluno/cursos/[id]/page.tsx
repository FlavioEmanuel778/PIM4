import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardList, PenLine } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CourseIcon } from "@/components/CourseIcon";
import { requirePageUser } from "@/lib/auth-guard";
import { courseHours, getCourseForStudent } from "@/lib/courses";
import { formatGrade } from "@/lib/format";
import { toId } from "@/lib/params";

export const dynamic = "force-dynamic";
export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageUser("aluno");
  const id = toId((await params).id); if (!id) notFound();
  const data = await getCourseForStudent(user.id, id); if (!data) notFound();
  const { course, contents, exercises, quiz, progress } = data; const base = `/aluno/cursos/${course.id}`;
  const status = progress.done === 0 ? "Não iniciado" : progress.done >= progress.total ? "Concluído" : "Em andamento";
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <AppShell area="aluno" nav="/aluno" crumbs={["Aluno", `Meus Cursos › ${course.name}`]} user={user}>
      <div className="page">
        <Link className="back-link" href="/aluno"><ArrowLeft aria-hidden />Voltar para Meus Cursos</Link>
        <div className="page-head"><div><h1>{course.name}</h1><p>{course.tagline}</p></div></div>
        <div className="card overview">
          <CourseIcon icon={course.icon} />
          <div className="who"><strong>{course.teacherName ?? "Professor a definir"}</strong><span>{courseHours(course)} • {course.lessons} aulas • {course.level}</span>
            <span className="pill pill-blue" style={{ marginTop: 10, alignSelf: "flex-start" }}>{status} • {quiz.grade !== null ? "Avaliação realizada" : "Avaliação não realizada"}</span></div>
          <div className="prog"><div className="progress-line"><span>{progress.done} de {progress.total} atividades concluídas</span><strong>{progress.percent}%</strong></div><div className="bar"><i style={{ width: `${progress.percent}%` }} /></div></div>
        </div>
        <h2 className="section-title">Conteúdos</h2><p className="section-sub">Estude no seu ritmo. Você pode revisar os conteúdos quando quiser.</p>
        <div className="card list-card">
          {contents.length === 0 && <div className="empty"><strong>Nenhum conteúdo publicado ainda</strong>O professor publicará os materiais em breve.</div>}
          {contents.map((c, i) => (
            <div className="item-row" key={c.id}>
              <span className="state num">{pad(i + 1)}</span>
              <div className="txt"><h3>{c.title}</h3><p>{c.description}</p></div>
              <span className={`pill ${c.done ? "pill-green" : "pill-amber"}`}>{c.done ? "Concluído" : "Pendente"}</span>
              <Link className="btn btn-outline btn-sm" href={`${base}/conteudos/${c.id}`}>Estudar</Link>
            </div>))}
        </div>
        <h2 className="section-title">Exercícios de prática</h2><p className="section-sub">Treine o que aprendeu. Estas atividades não valem nota.</p>
        <div className="exercise-grid">{exercises.map((x) => (
          <article className="card ex-card" key={x.id}>
            <div className="top"><PenLine aria-hidden /><span className={`pill ${x.done ? "pill-green" : "pill-amber"}`}>{x.done ? "Concluído" : "Pendente"}</span></div>
            <h3>{x.title}</h3><p className="meta">{x.done ? "Prática finalizada • Sem nota" : "1 pergunta • Feedback ao responder"}</p>
            <Link className={`btn btn-sm ${x.done ? "btn-outline" : "btn-primary"}`} href={`${base}/exercicios/${x.id}`}>{x.done ? "Revisar exercício" : "Praticar"}</Link>
          </article>))}
        </div>
        {quiz.questions > 0 && (
          <div className="quiz-banner" style={{ marginTop: 24 }}>
            <span className="ico"><ClipboardList aria-hidden /></span>
            <div className="txt"><strong>Questionário avaliativo</strong><span>{quiz.questions} questões • 1 ponto por questão • Nota de 0 a 10</span>
              <span><span className={`pill ${quiz.grade !== null ? "pill-green" : "pill-gray"}`} style={{ marginTop: 8 }}>{quiz.grade !== null ? `Concluído • ${formatGrade(quiz.grade)}/10` : "Não realizado • Sem nota"}</span></span></div>
            <Link className="btn btn-primary" href={quiz.attempt ? `${base}/resultado` : quiz.grade !== null ? "/aluno/notas" : `${base}/questionario`}>{quiz.attempt ? "Ver resultado" : quiz.grade !== null ? "Ver notas" : "Iniciar questionário"}</Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
