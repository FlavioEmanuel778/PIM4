"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CircleAlert, Send } from "lucide-react";
import type { Choice, QuizQuestion } from "@/lib/courses";

export function QuizRunner({ courseId, questions }: { courseId: number; questions: QuizQuestion[] }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, Choice>>({});
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const done = Object.keys(answers).length; const total = questions.length; const ready = done === total; const percent = Math.round((done / total) * 100);
  const pad = (n: number) => String(n).padStart(2, "0");

  async function submit() {
    if (!ready) return; setBusy(true); setError("");
    try {
      const res = await fetch(`/api/aluno/cursos/${courseId}/questionario`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok && res.status !== 409) { setError(data.message ?? "Não foi possível enviar."); return; }
      router.push(`/aluno/cursos/${courseId}/resultado`); router.refresh();
    } catch { setError("Não foi possível conectar. Tente de novo."); } finally { setBusy(false); }
  }

  return (
    <>
      <div className="card quiz-top">
        <div className="line"><strong>{done} de {total} questões respondidas</strong><span className={`pill ${ready ? "pill-green" : "pill-gray"}`}>{ready ? "Pronto para enviar" : `Faltam ${total - done}`}</span></div>
        <div className="bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${percent}%` }} /></div>
        <div className="chips" aria-hidden style={{ marginTop: 12 }}>{questions.map((q, i) => <span key={q.id} className={`chip${answers[q.id] ? " answered" : ""}`}>{pad(i + 1)}</span>)}</div>
        <p className="progress-sub">{ready ? "Todas as alternativas estão preenchidas. Você ainda pode revisar suas escolhas; a nota só será calculada após o envio." : "Cada questão vale 1 ponto. Escolha uma alternativa por questão."}</p>
      </div>
      {questions.map((q, i) => (
        <section className="card q-block" key={q.id} aria-labelledby={`q${q.id}`}>
          <div className="meta"><span>Questão {pad(i + 1)} de {total} • {q.category}</span><span>1 ponto • {answers[q.id] ? "Respondida" : "Não respondida"}</span></div>
          <h3 id={`q${q.id}`}>{q.prompt}</h3>
          <div className="options" role="radiogroup" aria-labelledby={`q${q.id}`}>
            {(Object.entries(q.options) as [Choice, string][]).map(([letter, text]) => (
              <button key={letter} type="button" role="radio" aria-checked={answers[q.id] === letter} className="option radio" onClick={() => setAnswers((a) => ({ ...a, [q.id]: letter }))}><span className="dot" /><span className="letter">{letter}</span><span>{text}</span></button>
            ))}
          </div>
        </section>
      ))}
      {error && <div className="alert alert-error" role="alert"><CircleAlert aria-hidden />{error}</div>}
      <div className="submit-bar">
        <div><strong>{ready ? "Tudo pronto para enviar" : "Responda todas as questões"}</strong><span>{ready ? `Você respondeu às ${total} questões. Ao enviar, sua avaliação será concluída e a nota será registrada em Notas.` : `Faltam ${total - done} questões para poder enviar.`}</span></div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="pill pill-gray">{done} de {total} respondidas</span>
          <Link className="btn btn-neutral" href={`/aluno/cursos/${courseId}`}>Voltar ao curso</Link>
          <button className="btn btn-primary" onClick={submit} disabled={!ready || busy}><Send aria-hidden />{busy ? "Enviando…" : "Enviar"}</button>
        </div>
      </div>
    </>
  );
}
