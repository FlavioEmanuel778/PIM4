import { ClipboardCheck, Clock, Award, Info } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { requirePageUser } from "@/lib/auth-guard";
import { getGrades } from "@/lib/courses";
import { formatDate, formatGrade } from "@/lib/format";

export const metadata = { title: "Notas • EduDigital" };
export const dynamic = "force-dynamic";

export default async function GradesPage() {
  const user = await requirePageUser("aluno");
  const g = await getGrades(user.id);
  const taken = g.quizzes.filter((q) => q.done); const pending = g.quizzes.filter((q) => !q.done);
  const last = taken[taken.length - 1];
  const label = { quiz: { done: "Concluída", pending: "Não realizada", in_progress: "Em andamento" }, exercise: { done: "Concluídos", pending: "Pendentes", in_progress: "Em andamento" } } as const;
  const tone = { done: "pill-green", pending: "pill-amber", in_progress: "pill-amber" } as const;
  return (
    <AppShell area="aluno" nav="/aluno/notas" crumbs={["Aluno", "Notas"]} user={user}>
      <div className="page">
        <div className="page-head"><div><h1>Notas</h1><p>Acompanhe suas avaliações e o histórico das suas atividades.</p></div></div>
        <div className="grades-stats">
          <div className="card gstat"><div className="top"><small>{taken.length === 1 ? "Avaliação concluída" : "Avaliações concluídas"}</small><ClipboardCheck aria-hidden /></div><strong>{taken.length}</strong></div>
          <div className="card gstat"><div className="top"><small>{last ? `Nota em ${last.course}` : "Sua nota"}</small><Award aria-hidden /></div><strong>{last ? formatGrade(last.grade!) : "—"}</strong></div>
          <div className="card gstat"><div className="top"><small>{pending.length === 1 ? "Avaliação não realizada" : "Avaliações não realizadas"}</small><Clock aria-hidden /></div><strong>{pending.length}</strong></div>
        </div>
        <div className="card table-card">
          <div className="grades-head"><div><h2>Histórico de atividades</h2><small>{g.lastUpdate ? `Atualizado em ${formatDate(g.lastUpdate)} • Após a avaliação de ${last?.course ?? "seus cursos"}` : "Suas atividades aparecerão aqui conforme você avança."}</small></div></div>
          {g.rows.length === 0 ? <div className="empty"><strong>Você ainda não está em nenhum curso</strong>Escolha um curso em Meus Cursos para começar.</div> : (
            <div className="table-scroll"><table className="table">
              <thead><tr><th>Curso</th><th>Atividade</th><th>Situação</th><th>Nota</th></tr></thead>
              <tbody>{g.rows.map((r, i) => (
                <tr key={i}>
                  <td><strong style={{ color: "var(--ink)" }}>{r.course}</strong></td>
                  <td className="act"><span style={{ color: "var(--ink)" }}>{r.activity}</span><small>{r.detail}</small></td>
                  <td><span className={`pill ${tone[r.status]}`}>{label[r.kind][r.status]}</span></td>
                  <td className={`grade${r.grade === null ? " none" : ""}`}>{r.grade !== null ? <span style={{ color: "var(--blue)" }}>{formatGrade(r.grade)} / 10</span> : r.kind === "exercise" ? "Sem nota" : "—"}</td>
                </tr>))}
              </tbody>
            </table></div>)}
        </div>
        <div className="callout info" style={{ marginTop: 20 }}><Info aria-hidden /><div><strong>Como sua nota é calculada</strong><p>Cada questionário tem 10 questões de 1 ponto. A nota vai de 0 a 10. Avaliações não realizadas ficam sem nota; exercícios de prática não são avaliativos.</p></div></div>
      </div>
    </AppShell>
  );
}
