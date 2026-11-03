"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CircleAlert, CircleCheck, CircleX, Info, RotateCcw } from "lucide-react";
import type { Choice } from "@/lib/courses";

type Exercise = { id: number; title: string; category: string; prompt: string; scenario: string; a: string; b: string; c: string; d: string };
type Result = { correct: boolean; correctChoice: Choice; feedback: string };

export function ExerciseRunner({ exercise, courseId, courseName, reviewed }: { exercise: Exercise; courseId: number; courseName: string; reviewed: Result | null }) {
  const [choice, setChoice] = useState<Choice | null>(reviewed?.correctChoice ?? null);
  const [result, setResult] = useState<Result | null>(reviewed);
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const options: [Choice, string][] = [["A", exercise.a], ["B", exercise.b], ["C", exercise.c], ["D", exercise.d]];
  const back = `/aluno/cursos/${courseId}`;

  async function submit() {
    if (!choice) return; setBusy(true); setError("");
    try {
      const res = await fetch(`/api/aluno/exercicios/${exercise.id}/responder`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ choice }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.message ?? "Não foi possível enviar a resposta."); return; }
      setResult(data);
    } catch { setError("Não foi possível conectar. Tente de novo."); } finally { setBusy(false); }
  }
  const retry = () => { setChoice(null); setResult(null); };

  return (
    <>
      <p className="status-line"><span className={`pill ${result ? "pill-blue" : "pill-gray"}`}>{result ? "Resposta enviada" : "Aguardando resposta"}</span><span>Prática sem nota • Pergunta única</span></p>
      <section className="card q-card">
        <p className="tag">{exercise.category}</p>
        <h2>{exercise.prompt}</h2><p className="scenario">{exercise.scenario}</p>
        <div className="options" role="radiogroup" aria-label="Alternativas">
          {options.map(([letter, text]) => {
            const selected = choice === letter;
            const state = result ? (letter === result.correctChoice ? "correct" : selected ? "wrong" : "") : "";
            return (
              <button key={letter} type="button" role="radio" aria-checked={selected} className={`option radio ${state}`} disabled={!!result || busy} onClick={() => setChoice(letter)}>
                <span className="dot" /><span className="letter">{letter}</span><span>{text}</span>
                {result && selected && <span className="tagline">Sua resposta</span>}
                {result && !selected && state === "correct" && <span className="tagline">Resposta correta</span>}
              </button>
            );
          })}
        </div>
        {error && <div className="alert alert-error" role="alert" style={{ marginTop: 16 }}><CircleAlert aria-hidden />{error}</div>}
        {result && (
          <div className={`feedback ${result.correct ? "ok" : "bad"}`} role="status">
            {result.correct ? <CircleCheck aria-hidden /> : <CircleX aria-hidden />}
            <div>
              <strong>{result.correct ? "Resposta correta!" : "Resposta incorreta. Vamos aprender com ela?"}</strong>
              <p>{result.correct ? result.feedback : `A resposta correta é ${result.correctChoice}. ${result.feedback}`}</p>
            </div>
          </div>
        )}
        <div className="q-foot">
          <small>{!result ? (choice ? "Sua resposta ainda não foi enviada." : "Selecione uma alternativa e use o botão Responder para conferir o feedback.") : result.correct ? "Prática concluída • Nenhuma nota atribuída" : "Prática pendente • Você pode tentar novamente"}</small>
          <div className="btn-row">
            {!result && <button className="btn btn-primary" onClick={submit} disabled={!choice || busy}>{busy ? "Enviando…" : "Responder"}</button>}
            {result && !result.correct && <><Link className="btn btn-neutral" href={back}>Voltar ao curso</Link><button className="btn btn-primary" onClick={retry}><RotateCcw aria-hidden />Tentar novamente</button></>}
            {result?.correct && <Link className="btn btn-primary" href={back}><ArrowLeft aria-hidden />Voltar ao curso</Link>}
          </div>
        </div>
      </section>
      <div className="callout info" style={{ marginTop: 24 }}><Info aria-hidden /><div><strong>Aqui, errar também faz parte</strong><p>As práticas servem para aprender. A nota do curso é calculada apenas no questionário avaliativo.</p></div></div>
    </>
  );
}
