"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, CircleAlert } from "lucide-react";

export function EnrollButton({ courseId }: { courseId: number }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function enroll() {
    setBusy(true); setError("");
    const res = await fetch("/api/aluno/matriculas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId }) }).catch(() => null);
    setBusy(false);
    if (!res?.ok) { setError("Não foi possível fazer a matrícula."); return; }
    router.refresh();
  }
  return <div><button className="btn btn-primary btn-sm" onClick={enroll} disabled={busy}>{busy ? "Matriculando…" : "Matricular-me"}<ArrowRight aria-hidden /></button>{error && <p className="field-error"><CircleAlert aria-hidden />{error}</p>}</div>;
}

export function CompleteContentButton({ contentId, done, courseHref, nextHref }: { contentId: number; done: boolean; courseHref: string; nextHref: string | null }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function complete() {
    setBusy(true); setError("");
    const res = await fetch(`/api/aluno/conteudos/${contentId}/concluir`, { method: "POST" }).catch(() => null);
    setBusy(false);
    if (!res?.ok) { setError("Não foi possível registrar. Tente de novo."); return; }
    router.push(nextHref ?? courseHref); router.refresh();
  }
  return (
    <div>
      {done
        ? <a className="btn btn-outline" href={nextHref ?? courseHref}>{nextHref ? "Próximo conteúdo" : "Voltar ao curso"}<ArrowRight aria-hidden /></a>
        : <button className="btn btn-primary" onClick={complete} disabled={busy}><Check aria-hidden />{busy ? "Salvando…" : "Marcar como concluído"}</button>}
      {error && <p className="field-error"><CircleAlert aria-hidden />{error}</p>}
    </div>
  );
}
