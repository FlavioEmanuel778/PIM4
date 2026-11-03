"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CircleAlert, CircleCheck, Eye, Pencil, Trash2, X } from "lucide-react";
import { initials } from "@/lib/format";

type Item = { id: string; name: string; email: string; courses: string | null };
const COPY = {
  aluno: { base: "/admin/alunos", singular: "aluno", Singular: "Aluno", hasCourse: false },
  professor: { base: "/admin/professores", singular: "professor", Singular: "Professor", hasCourse: true }
};

// Tabela com ações de visualizar, editar e excluir (com confirmação em janela modal).
export function UsersTable({ role, items, savedName }: { role: "aluno" | "professor"; items: Item[]; savedName?: string | null }) {
  const c = COPY[role]; const router = useRouter();
  const [target, setTarget] = useState<Item | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const [banner, setBanner] = useState<{ title: string; text: string } | null>(savedName ? { title: `${c.Singular} salvo com sucesso!`, text: `O cadastro de ${savedName} foi salvo na EduDigital.` } : null);

  async function remove() {
    if (!target) return; setBusy(true); setError("");
    try {
      const res = await fetch(`/api/admin/usuarios/${target.id}`, { method: "DELETE" });
      if (!res.ok) { setError((await res.json().catch(() => ({}))).message ?? "Não foi possível excluir."); return; }
      setBanner({ title: `${c.Singular} excluído.`, text: `O cadastro de ${target.name} foi removido da EduDigital.` });
      setTarget(null); router.refresh();
    } catch { setError("Não foi possível conectar. Tente de novo."); } finally { setBusy(false); }
  }

  return (
    <>
      {banner && <div className="banner" role="status"><CircleCheck aria-hidden /><div><strong>{banner.title}</strong><p>{banner.text}</p></div><button type="button" aria-label="Fechar aviso" onClick={() => setBanner(null)}><X aria-hidden /></button></div>}
      <div className="table-scroll">
        <table className="table">
          <thead><tr><th>Nome</th><th>E-mail</th><th className="col-actions">Ações</th></tr></thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id}>
                <td><div className="cell-user"><span className="avatar">{initials(u.name)}</span><div><strong>{u.name}</strong>{c.hasCourse && <small>{u.courses ?? "Sem curso vinculado"}</small>}</div></div></td>
                <td>{u.email}</td>
                <td className="col-actions"><div className="row-actions">
                  <Link className="icon-btn" href={`${c.base}/${u.id}`} aria-label={`Ver ${u.name}`} title="Visualizar"><Eye aria-hidden /></Link>
                  <Link className="icon-btn" href={`${c.base}/${u.id}/editar`} aria-label={`Editar ${u.name}`} title="Editar"><Pencil aria-hidden /></Link>
                  <button type="button" className="icon-btn danger" aria-label={`Excluir ${u.name}`} title="Excluir" onClick={() => { setError(""); setTarget(u); }}><Trash2 aria-hidden /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="empty"><strong>Nenhum cadastro encontrado</strong>Tente outro nome ou e-mail, ou crie um novo cadastro.</div>}
      </div>
      {target && (
        <div className="overlay" role="presentation" onClick={() => !busy && setTarget(null)}>
          <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="del-title" onClick={(e) => e.stopPropagation()}>
            <span className="ico"><Trash2 aria-hidden /></span>
            <h2 id="del-title">Tem certeza que deseja excluir?</h2>
            <p>O cadastro deste {c.singular} será excluído. Esta ação não pode ser desfeita.</p>
            <div className="who"><span className="avatar">{initials(target.name)}</span><div><strong>{target.name}</strong><small>{target.email}</small></div></div>
            {error && <div className="alert alert-error" role="alert"><CircleAlert aria-hidden />{error}</div>}
            <div className="modal-actions">
              <button type="button" className="btn btn-neutral btn-sm" onClick={() => setTarget(null)} disabled={busy}>Cancelar</button>
              <button type="button" className="btn btn-danger btn-sm" onClick={remove} disabled={busy}>{busy ? "Excluindo…" : "Excluir"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
