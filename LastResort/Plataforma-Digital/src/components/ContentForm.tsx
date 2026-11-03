"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Check, CircleAlert, FileText, Link2, Paperclip, Upload } from "lucide-react";
import { Field } from "@/components/Field";

type Existing = { id: number; title: string; description: string; published: boolean; material: { kind: "arquivo" | "link"; name: string | null; size: number | null; url: string | null } | null };
const MAX = 20 * 1024 * 1024; const EXT = ["pdf", "docx", "mp4"];
const ext = (name: string | null) => (name?.split(".").pop() ?? "").toUpperCase();
const size = (n: number | null) => n == null ? "" : n >= 1048576 ? `${(n / 1048576).toFixed(1).replace(".", ",")} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;

// Adicionar/editar conteúdo: anexo (PDF, DOCX ou MP4 até 20 MB) ou link externo.
export function ContentForm({ courseId, courseName, content }: { courseId: number; courseName: string; content?: Existing }) {
  const router = useRouter(); const editing = !!content; const input = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(content?.title ?? ""); const [description, setDescription] = useState(content?.description ?? "");
  const [published, setPublished] = useState(content?.published ?? true);
  const [kind, setKind] = useState<"arquivo" | "link">(content?.material?.kind ?? "arquivo");
  const [url, setUrl] = useState(content?.material?.kind === "link" ? content.material.url ?? "" : "");
  const [file, setFile] = useState<File | null>(null); const [drag, setDrag] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({}); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const current = content?.material?.kind === "arquivo" ? content.material : null;
  const back = `/professor/conteudos?curso=${courseId}`;

  function pick(f: File | null) {
    if (!f) return;
    if (!EXT.includes(f.name.split(".").pop()?.toLowerCase() ?? "")) { setErrors((e) => ({ ...e, file: "Use um arquivo PDF, DOCX ou MP4." })); return; }
    if (f.size > MAX) { setErrors((e) => ({ ...e, file: "O arquivo deve ter no máximo 20 MB." })); return; }
    setErrors((e) => { const { file: _f, ...rest } = e; return rest; }); setFile(f);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(""); setErrors({});
    const fd = new FormData();
    fd.set("courseId", String(courseId)); fd.set("title", title); fd.set("description", description); fd.set("published", published ? "true" : "false"); fd.set("kind", kind); fd.set("url", url);
    if (kind === "arquivo" && file) fd.set("file", file);
    try {
      const res = await fetch(editing ? `/api/professor/conteudos/${content!.id}` : "/api/professor/conteudos", { method: editing ? "PUT" : "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErrors(data.errors ?? {}); setError(data.message ?? "Não foi possível salvar."); return; }
      router.push(`${back}&salvo=${editing ? "editado" : "criado"}`); router.refresh();
    } catch { setError("Não foi possível conectar. Tente de novo."); } finally { setBusy(false); }
  }

  return (
    <div className="form-two">
      <form className="card form-card" onSubmit={submit} noValidate>
        {error && <div className="alert alert-error" role="alert"><CircleAlert aria-hidden />{error}</div>}
        <p className="mini-label">Disciplina</p><p className="strong-line">{courseName}</p>
        <Field id="title" label="Título do conteúdo *" error={errors.title}><input id="title" className={`input${errors.title ? " error" : ""}`} placeholder="Digite o título do conteúdo" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field id="description" label="Descrição *" error={errors.description}><textarea id="description" className={`input textarea${errors.description ? " error" : ""}`} placeholder="Descreva o conteúdo e oriente os alunos sobre o material." value={description} onChange={(e) => setDescription(e.target.value)} /></Field>

        <h3 className="form-section">Anexo ou link</h3><p className="sub" style={{ marginTop: -14 }}>Escolha uma das opções para acompanhar o conteúdo.</p>
        <div className="radio-cards" role="radiogroup" aria-label="Tipo de material">
          <button type="button" role="radio" aria-checked={kind === "arquivo"} className="radio-card" onClick={() => setKind("arquivo")}><span className="dot" /><Paperclip aria-hidden />Anexar arquivo</button>
          <button type="button" role="radio" aria-checked={kind === "link"} className="radio-card" onClick={() => setKind("link")}><span className="dot" /><Link2 aria-hidden />Inserir link (URL)</button>
        </div>

        {kind === "arquivo" ? (
          <div className={`dropzone${drag ? " drag" : ""}${errors.file ? " bad" : ""}`} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0] ?? null); }}>
            <Upload aria-hidden />
            {file ? <><strong>{file.name}</strong><span>{ext(file.name)} • {size(file.size)} • Novo arquivo</span></>
              : current ? <><strong>{current.name}</strong><span>{ext(current.name)} • {size(current.size)} • Anexo atual</span></>
              : <><strong>Arraste um arquivo ou selecione no computador</strong><span>PDF, DOCX ou MP4 • Até 20 MB</span></>}
            <input ref={input} type="file" className="sr-only" accept=".pdf,.docx,.mp4" onChange={(e) => pick(e.target.files?.[0] ?? null)} aria-label="Selecionar arquivo" />
            <button type="button" className="btn btn-neutral btn-sm" onClick={() => input.current?.click()}><Paperclip aria-hidden />{current || file ? "Substituir arquivo" : "Selecionar arquivo"}</button>
          </div>
        ) : (
          <Field id="url" label="URL do material" error={errors.url} hint="O link será aberto em uma nova aba para os alunos.">
            <div className="input-wrap"><input id="url" className={`input has-icon${errors.url ? " error" : ""}`} placeholder="https://exemplo.com/material" value={url} onChange={(e) => setUrl(e.target.value)} inputMode="url" /><span className="input-icon" style={{ pointerEvents: "none" }}><Link2 aria-hidden /></span></div>
          </Field>
        )}
        {errors.file && <p className="field-error" role="alert"><CircleAlert aria-hidden />{errors.file}</p>}

        <label className="check"><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />Publicado (visível para os alunos da disciplina)</label>
        <p className="hint">* Campos obrigatórios</p>
        <div className="form-actions"><Link className="btn btn-neutral" href={back}>Cancelar</Link><button className="btn btn-primary" disabled={busy}><Check aria-hidden />{busy ? "Salvando…" : editing ? "Salvar alterações" : "Salvar"}</button></div>
      </form>
      <aside className="stack">
        <div className="callout info" style={{ margin: 0 }}><FileText aria-hidden /><div><strong>{editing ? "Revise antes de salvar" : "Um conteúdo de cada vez"}</strong><p>{editing ? "As alterações serão aplicadas ao conteúdo existente. Para manter o anexo atual, não selecione outro arquivo." : "Use um título claro e uma descrição breve para ajudar os alunos a encontrar o material."}</p></div></div>
        <div className="card side-card"><Check aria-hidden /><h3>Antes de publicar</h3><p>Confira se o arquivo está legível ou se o endereço do link está correto.</p><p>Prefira materiais acessíveis, com texto selecionável e descrições para imagens.</p></div>
      </aside>
    </div>
  );
}
