import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Award, CircleCheck, CircleX } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { requirePageUser } from "@/lib/auth-guard";
import { getQuizResult } from "@/lib/courses";
import { firstName, formatDate, formatGrade } from "@/lib/format";
import { toId } from "@/lib/params";

export const dynamic = "force-dynamic";
export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageUser("aluno");
  const courseId = toId((await params).id); if (!courseId) notFound();
  const r = await getQuizResult(user.id, courseId);
  if (!r) redirect(`/aluno/cursos/${courseId}/questionario`);
  const { attempt, items, course, grade } = r; const wrong = items.filter((i) => !i.ok); const pad = (n: number) => String(n).padStart(2, "0");
  const percent = Math.round((attempt.correct / attempt.total) * 100);
  return (
    <AppShell area="aluno" nav="/aluno" crumbs={["Aluno", `${course.name} › Resultado`]} user={user}>
      <div className="page">
        <div className="page-head"><div><h1>Resultado da avaliação</h1><p>{course.name} • Questionário avaliativo concluído em {formatDate(attempt.createdAt)}</p></div></div>
        <div className="card score-card">
          <div className="score-left"><Award aria-hidden /><b>Sua nota</b><div className="big">{formatGrade(grade)}<span> / 10</span></div><span className="pill pill-green">Avaliação concluída</span></div>
          <div className="score-right">
            <h2>{grade >= 7 ? `Muito bem, ${firstName(user.name)}!` : `Boa tentativa, ${firstName(user.name)}!`}</h2>
            <p>Você acertou {percent}% das questões. Continue colocando em prática o que aprendeu.</p>
            <div className="score-inline">
              <span className="ok"><CircleCheck aria-hidden /><b>{attempt.correct}</b>Acertos</span>
              <span className="bad"><CircleX aria-hidden /><b>{attempt.total - attempt.correct}</b>Erros</span>
            </div>
            <p className="foot">{attempt.total} questões • 1 ponto por acerto • {attempt.correct} {attempt.correct === 1 ? "ponto obtido" : "pontos obtidos"}</p>
          </div>
        </div>
        {wrong.length > 0 ? (<>
          <h2 className="section-title" style={{ marginTop: 0 }}>O que vale revisar</h2>
          <div className="review-grid">{wrong.map((i) => (
            <section className="card review" key={i.position}>
              <span className="pill pill-red">Questão {pad(i.position)} • Resposta incorreta</span>
              <h3>{i.topic}</h3>
              <p className="mine">Você marcou {i.chosen}: {i.chosenText}</p>
              <p className="right">Correta: {i.correct} — {i.correctText}</p>
              <p>{i.explanation}</p>
            </section>))}
          </div>
        </>) : <div className="callout"><CircleCheck aria-hidden /><div><strong>Parabéns, você acertou tudo!</strong><p>Não há nada para revisar neste questionário.</p></div></div>}
        <div className="callout" style={{ marginTop: 20 }}><CircleCheck aria-hidden /><div><strong>Sua nota foi registrada</strong><p>O resultado {formatGrade(grade)}/10 já aparece em Notas. As práticas não entram no cálculo desta avaliação.</p></div></div>
        <div className="action-bar" style={{ justifyContent: "flex-end" }}>
          <Link className="btn btn-neutral" href="/aluno/notas">Ver minhas notas</Link>
          <Link className="btn btn-primary" href={`/aluno/cursos/${courseId}`}><ArrowLeft aria-hidden />Voltar ao curso</Link>
        </div>
      </div>
    </AppShell>
  );
}
