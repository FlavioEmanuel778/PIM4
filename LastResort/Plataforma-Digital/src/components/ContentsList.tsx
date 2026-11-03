"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CircleAlert, CircleCheck, FileText, Link2, Pencil, Trash2, X } from "lucide-react";

type Item = { id: number; title: string; description: string; published: boolean; material: { kind: "arquivo" | "link"; name: string | null; size: number | null; url: string | null } | null };
const ext = (name: string | null) => (name?.split(".").pop() ?? "").toUpperCase();
const size = (n: number | null) => n == null ? "" : n >= 1048576 ? `${(n / 1048576).toFixed(1).replace(".", ",")} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;

export function ContentsList({ courseId, items, saved }: { courseId: number; items: Item[]; saved?: "criado" | "editado" | null }) {
  const router = useRouter();
  const [target, setTarget] = useState<Item | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const [banner, setBanner] = useState<string | null>(saved === "criado" ? "Conteúdo adicionado com sucesso!" : saved === "editado" ? "Conteúdo atualizado com sucesso!" : null);

  async function remove() {
    if (!target) return; setBusy(true); setError("");
    try {
      const res = await fetch(`/api/professor/conteudos/${target.id}`, { method: "DELETE" });
      if (!res.ok) { setError((await res.json().catch(() => ({}))).message ?? "Não foi possível excluir."); return; }
      setBanner(`“${target.title}” foi excluído.`); setTarget(null); router.refresh();
    } catch { setError("Não foi possível conectar. Tente de novo."); } finally { setBusy(false); }
  }

  return (
    <>
      {banner && <div className="banner" style={{ margin: "16px 20px 0" }} role="status"><CircleCheck aria-hidden /><div><strong>{banner}</strong></div><button type="button" aria-label="Fechar aviso" onClick={() => setBanner(null)}><X aria-hidden /></button></div>}
      {items.length === 0 && <div className="empty"><strong>Nenhum conteúdo ainda</strong>Use “Adicionar conteúdo” para publicar o primeiro material.</div>}
      {items.map((c) => (
        <div className="content-row" key={c.id}>
          <span className="state">{c.material?.kind === "link" ? <Link2 aria-hidden /> : <FileText aria-hidden />}</span>
          <div className="txt">
            <h3>{c.title}</h3><p>{c.description}</p>
            <p className="meta">{c.material?.kind === "arquivo" ? `${c.material.name} • ${ext(c.material.name)} • ${size(c.material.size)}` : c.material?.kind === "link" ? "Material on-line • Link externo" : "Sem anexo"}</p>
          </div>
          <div className="actions">
            <span className={`pill ${c.published ? "pill-green" : "pill-gray"}`}>{c.published ? "Publicado" : "Rascunho"}</span>
            <div className="row-actions">
              <Link className="btn btn-neutral btn-sm btn-edit" href={`/professor/conteudos/${c.id}/editar?curso=${courseId}`}><Pencil aria-hidden />Editar</Link>
              <button type="button" className="btn btn-neutral btn-sm btn-del" onClick={() => { setError(""); setTarget(c); }}><Trash2 aria-hidden />Excluir</button>
            </div>
          </div>
        </div>
      ))}
      {target && (
        <div className="overlay" role="presentation" onClick={() => !busy && setTarget(null)}>
          <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="cdel" onClick={(e) => e.stopPropagation()}>
            <span className="ico"><Trash2 aria-hidden /></span>
            <h2 id="cdel">Tem certeza que deseja excluir?</h2>
            <p>O conteúdo “{target.title}” e o material anexado serão removidos para os alunos. Esta ação não pode ser desfeita.</p>
            {error && <div className="alert alert-error" role="alert"><CircleAlert aria-hidden />{error}</div>}
            <div className="modal-actions"><button type="button" className="btn btn-neutral btn-sm" onClick={() => setTarget(null)} disabled={busy}>Cancelar</button><button type="button" className="btn btn-danger btn-sm" onClick={remove} disabled={busy}>{busy ? "Excluindo…" : "Excluir"}</button></div>
          </div>
        </div>
      )}
    </>
  );
}
