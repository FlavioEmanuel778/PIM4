"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, CircleAlert, CircleCheck, X } from "lucide-react";
import { formatGrade } from "@/lib/format";

type Row = { id: string; name: string; email: string; registration: string | null; grade: number | null };
const valid = (v: string) => v.trim() === "" || (/^\d{1,2}([.,]\d)?$/.test(v.trim()) && Number(v.trim().replace(",", ".")) <= 10);

// Lançamento de notas da turma: campo com vírgula decimal, validação por linha e salvamento único.
export function GradesForm({ courseId, courseName, rows }: { courseId: number; courseName: string; rows: Row[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(Object.fromEntries(rows.map((r) => [r.id, r.grade === null ? "" : formatGrade(r.grade)])));
  const [errors, setErrors] = useState<Record<string, string>>({}); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const [saved, setSaved] = useState<number | null>(null);
  const filled = Object.values(values).filter((v) => v.trim() !== "").length;

  async function save() {
    const local: Record<string, string> = {};
    for (const r of rows) if (!valid(values[r.id])) local[r.id] = "Use de 0 a 10, com vírgula, como 7,5";
    setErrors(local); setError(""); setSaved(null);
    if (Object.keys(local).length) { setError("Revise as notas indicadas antes de salvar."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/professor/notas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId, grades: values }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErrors(data.errors ?? {}); setError(data.message ?? "Não foi possível salvar."); return; }
      setSaved(filled); router.refresh();
    } catch { setError("Não foi possível conectar. Tente de novo."); } finally { setBusy(false); }
  }

  return (
    <>
      {saved !== null && <div className="banner" role="status"><CircleCheck aria-hidden /><div><strong>Notas salvas com sucesso!</strong><p>{saved === 1 ? "A nota" : `As ${saved} notas`} do Questionário avaliativo de {courseName} {saved === 1 ? "foi registrada" : "foram registradas"}.</p></div><button type="button" aria-label="Fechar aviso" onClick={() => setSaved(null)}><X aria-hidden /></button></div>}
      {error && <div className="alert alert-error" role="alert"><CircleAlert aria-hidden />{error}</div>}
      <div className="card table-card">
        <div className="grades-head"><div><h2>Questionário avaliativo</h2><small>{courseName} • {rows.length} {rows.length === 1 ? "aluno" : "alunos"}</small></div><span className="pill pill-blue">{saved !== null ? `${saved} ${saved === 1 ? "nota salva" : "notas salvas"}` : `${filled} ${filled === 1 ? "nota preenchida" : "notas preenchidas"}`}</span></div>
        <div className="table-scroll"><table className="table">
          <thead><tr><th>Aluno</th><th>Matrícula</th><th style={{ width: 150 }}>Nota (0 a 10)</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.id}>
              <td><div className="cell-user"><div><strong>{r.name}</strong><small>{r.email}</small></div></div></td>
              <td>{r.registration ?? "—"}</td>
              <td>
                <input className={`input grade-input${errors[r.id] ? " error" : ""}`} inputMode="decimal" aria-label={`Nota de ${r.name}`} placeholder="—" value={values[r.id]} onChange={(e) => { setValues({ ...values, [r.id]: e.target.value }); setSaved(null); }} />
                {errors[r.id] && <p className="field-error" role="alert"><CircleAlert aria-hidden />{errors[r.id]}</p>}
              </td>
            </tr>))}
          </tbody>
        </table>{rows.length === 0 && <div className="empty"><strong>Nenhum aluno matriculado</strong>Quando alguém se matricular, aparecerá aqui.</div>}</div>
        <div className="table-foot"><span>{saved !== null ? (saved === rows.length ? "Notas registradas para todos os alunos." : `${saved} notas registradas.`) : `Revise as ${filled} notas antes de salvar.`}</span><button className="btn btn-primary" onClick={save} disabled={busy || rows.length === 0}><Check aria-hidden />{busy ? "Salvando…" : "Salvar"}</button></div>
      </div>
    </>
  );
}
